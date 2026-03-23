import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { sanitizeString } from '../utils/sanitize'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model'
import { RefreshToken } from '../models/refreshToken.model'
import { generateTokens, getRefreshTokenExpiry } from '../utils/generateTokens'
import { setAuthCookies, clearAuthCookies } from '../utils/cookies'
import { generateOTP, verifyOTP, canResendOTP, getResendCooldown } from '../utils/otp'
import { sendOTPEmail, sendPasswordResetEmail, sendSecurityAlertEmail } from '../utils/email'
import { AppError } from '../middleware/errorHandler'
import { env } from '../config/env'
import {
  RegisterInput,
  LoginInput,
  VerifyOTPInput,
  ResendOTPInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../schemas/auth.schema'

const BCRYPT_ROUNDS = 12

// ── Save hashed refresh token to DB ───────────────────────────────
const saveRefreshToken = async (
  userId: mongoose.Types.ObjectId,
  refreshToken: string
): Promise<void> => {
  const hashedToken = await bcrypt.hash(refreshToken, 10)
  await RefreshToken.create({
    userId,
    token: hashedToken,
    expiresAt: getRefreshTokenExpiry(),
  })
}

// ── Register ───────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as RegisterInput

  // sanitise string inputs
  const name = sanitizeString(body.name)
  const username = sanitizeString(body.username)
  const email = sanitizeString(body.email)
  const { password } = body
  
  const existingEmail = await User.findOne({ email })
  if (existingEmail) {
    throw new AppError('Email already registered', 409)
  }

  const existingUsername = await User.findOne({ username })
  if (existingUsername) {
    throw new AppError('Username already taken', 409)
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const { otp, hashedOtp, otpExpiry } = await generateOTP()

  const user = await User.create({
    name,
    username,
    email,
    passwordHash,
    otp: hashedOtp,
    otpExpiry,
    otpAttempts: 0,
    otpLastSent: new Date(),
    isVerified: false,
  })

  const emailResult = await sendOTPEmail(email, name, otp)
  if (!emailResult.success) {
    console.error('❌ OTP email failed for:', email)
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: { email: user.email },
  })
}

// ── Verify OTP ─────────────────────────────────────────────────────
export const verifyOTPHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body as VerifyOTPInput

  const user = await User.findOne({ email }).select(
    '+otp +otpExpiry +otpAttempts +isVerified'
  )
  if (!user) {
    throw new AppError('Invalid credentials', 400)
  }

  if (user.isVerified) {
    throw new AppError('Email already verified. Please login.', 400)
  }

  if (!user.otp || !user.otpExpiry) {
    throw new AppError('No OTP found. Please request a new one.', 400)
  }

  if (user.otpAttempts >= 5) {
    throw new AppError('Too many attempts. Please request a new OTP.', 400)
  }

  const { valid, expired } = await verifyOTP(otp, user.otp, user.otpExpiry)

  if (expired) {
    user.otp = null as any
    user.otpExpiry = null as any
    user.otpAttempts = 0
    await user.save()
    throw new AppError('OTP has expired. Please request a new one.', 400)
  }

  if (!valid) {
    user.otpAttempts += 1
    await user.save()
    const remaining = 5 - user.otpAttempts
    throw new AppError(
      remaining > 0
        ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many attempts. Please request a new OTP.',
      400
    )
  }

  // OTP valid — mark verified
  user.isVerified = true
  user.otp = null as any
  user.otpExpiry = null as any
  user.otpAttempts = 0
  user.otpLastSent = null as any
  await user.save()

  const { accessToken, refreshToken } = generateTokens(user._id as any, user.email)
  await saveRefreshToken(user._id as mongoose.Types.ObjectId, refreshToken)
  setAuthCookies(res, accessToken, refreshToken)

  res.status(200).json({
    success: true,
    message: 'Email verified successfully.',
    data: { user },
  })
}

// ── Resend OTP ─────────────────────────────────────────────────────
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as ResendOTPInput

  const user = await User.findOne({ email })
  if (!user) {
    res.status(200).json({
      success: true,
      message: 'If that email exists, a new OTP has been sent.',
    })
    return
  }

  if (user.isVerified) {
    throw new AppError('Email already verified. Please login.', 400)
  }

  if (!canResendOTP(user.otpLastSent)) {
    const remaining = getResendCooldown(user.otpLastSent)
    throw new AppError(`Please wait ${remaining} seconds before resending.`, 429)
  }

  const { otp, hashedOtp, otpExpiry } = await generateOTP()

  user.otp = hashedOtp
  user.otpExpiry = otpExpiry
  user.otpAttempts = 0
  user.otpLastSent = new Date()
  await user.save()

  await sendOTPEmail(email, user.name, otp)

  res.status(200).json({
    success: true,
    message: 'New OTP sent. Please check your email.',
  })
}

// ── Login ──────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput

  const user = await User.findOne({ email }).select(
    '+passwordHash +isVerified +loginAttempts +lockUntil'
  )

  if (!user) {
    throw new AppError('Invalid credentials', 401)
  }

  if (user.isLocked()) {
    const minutesLeft = Math.ceil(
      ((user.lockUntil as Date).getTime() - Date.now()) / 60000
    )
    throw new AppError(
      `Account locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      423
    )
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    user.loginAttempts += 1
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
      await user.save()
      throw new AppError('Too many failed attempts. Account locked for 15 minutes.', 423)
    }
    await user.save()
    throw new AppError('Invalid credentials', 401)
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403)
  }

  user.loginAttempts = 0
  user.lockUntil = null as any
  await user.save()

  const { accessToken, refreshToken } = generateTokens(user._id as any, user.email)
  await saveRefreshToken(user._id as mongoose.Types.ObjectId, refreshToken)
  setAuthCookies(res, accessToken, refreshToken)

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: { user },
  })
}

// ── Refresh token ──────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken

  if (!token) {
    throw new AppError('No refresh token provided', 401)
  }

  // ── Verify JWT first to get userId ────────────────────────────
  let decoded: any
  try {
    decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET)
  } catch {
    clearAuthCookies(res)
    throw new AppError('Invalid refresh token. Please login again.', 401)
  }

  // ── Find all tokens for this user ─────────────────────────────
  const storedTokens = await RefreshToken.find({ userId: decoded.userId })

  if (!storedTokens.length) {
    clearAuthCookies(res)
    throw new AppError('Session expired. Please login again.', 401)
  }

  // ── Find matching token using bcrypt compare ───────────────────
  let matchedToken = null
  for (const storedToken of storedTokens) {
    const isMatch = await bcrypt.compare(token, storedToken.token)
    if (isMatch) {
      matchedToken = storedToken
      break
    }
  }

  if (!matchedToken) {
    // reuse attack detected — wipe all tokens + alert user
    await RefreshToken.deleteMany({ userId: decoded.userId })
    const user = await User.findById(decoded.userId)
    if (user) {
      await sendSecurityAlertEmail(user.email, user.name)
    }
    clearAuthCookies(res)
    throw new AppError('Invalid refresh token. Please login again.', 401)
  }

  // ── Check expiry ───────────────────────────────────────────────
  if (matchedToken.expiresAt < new Date()) {
    await matchedToken.deleteOne()
    clearAuthCookies(res)
    throw new AppError('Session expired. Please login again.', 401)
  }

  // ── Find user ──────────────────────────────────────────────────
  const user = await User.findById(matchedToken.userId)
  if (!user) {
    await matchedToken.deleteOne()
    clearAuthCookies(res)
    throw new AppError('User not found', 401)
  }

  // ── Token rotation ─────────────────────────────────────────────
  await matchedToken.deleteOne()

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id as any,
    user.email
  )

  await saveRefreshToken(user._id as mongoose.Types.ObjectId, newRefreshToken)
  setAuthCookies(res, accessToken, newRefreshToken)

  res.status(200).json({
    success: true,
    message: 'Token refreshed.',
  })
}

// ── Get current user ───────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { user },
  })
}

// ── Logout ─────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken

  if (token) {
    try {
      const decoded: any = jwt.verify(token, env.REFRESH_TOKEN_SECRET)
      const storedTokens = await RefreshToken.find({ userId: decoded.userId })

      for (const storedToken of storedTokens) {
        const isMatch = await bcrypt.compare(token, storedToken.token)
        if (isMatch) {
          await storedToken.deleteOne()
          break
        }
      }
    } catch {
      // invalid token — just clear cookies
    }
  }

  clearAuthCookies(res)

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
}

// ── Logout all devices ─────────────────────────────────────────────
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  await RefreshToken.deleteMany({ userId: req.user?.userId })
  clearAuthCookies(res)

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices.',
  })
}

// ── Forgot password ────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as ForgotPasswordInput

  const user = await User.findOne({ email })
  if (!user) {
    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset code has been sent.',
    })
    return
  }

  if (!canResendOTP(user.otpLastSent)) {
    const remaining = getResendCooldown(user.otpLastSent)
    throw new AppError(`Please wait ${remaining} seconds before requesting again.`, 429)
  }

  const { otp, hashedOtp, otpExpiry } = await generateOTP()

  user.otp = hashedOtp
  user.otpExpiry = otpExpiry
  user.otpAttempts = 0
  user.otpLastSent = new Date()
  await user.save()

  await sendPasswordResetEmail(email, user.name, otp)

  res.status(200).json({
    success: true,
    message: 'If that email exists, a reset code has been sent.',
  })
}

// ── Reset password ─────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body as ResetPasswordInput

  const user = await User.findOne({ email }).select(
    '+otp +otpExpiry +otpAttempts +passwordHash'
  )
  if (!user || !user.otp || !user.otpExpiry) {
    throw new AppError('Invalid or expired reset code', 400)
  }

  if (user.otpAttempts >= 5) {
    throw new AppError('Too many attempts. Please request a new reset code.', 400)
  }

  const { valid, expired } = await verifyOTP(otp, user.otp, user.otpExpiry)

  if (expired || !valid) {
    user.otpAttempts += 1
    await user.save()
    throw new AppError('Invalid or expired reset code', 400)
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  user.passwordHash = passwordHash
  user.otp = null as any
  user.otpExpiry = null as any
  user.otpAttempts = 0
  user.otpLastSent = null as any
  await user.save()

  await RefreshToken.deleteMany({ userId: user._id })
  clearAuthCookies(res)

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  })
}

// ── Change password ────────────────────────────────────────────────
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput

  const user = await User.findById(req.user?.userId).select('+passwordHash')
  if (!user) {
    throw new AppError('User not found', 404)
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    throw new AppError('Current password is incorrect', 400)
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  user.passwordHash = passwordHash
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
  })
}