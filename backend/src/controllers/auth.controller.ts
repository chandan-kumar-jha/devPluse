import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import { sanitizeString } from '../utils/sanitize'
import { User } from '../models/user.model'
import { RefreshToken } from '../models/refreshToken.model'

import { generateTokens, getRefreshTokenExpiry } from '../utils/generateTokens'
import { setAuthCookies } from '../utils/cookies'

import {
  generateOTP,
  verifyOTP,
  canResendOTP,
  getResendCooldown,
} from '../utils/otp'

import { sendOTPEmail } from '../utils/email'

import { AppError } from '../middleware/errorHandler'
import { VerifyOTPInput } from '../schemas/auth.schema'

// ── Save refresh token ─────────────────────────────
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

// ─────────────────────────────────────────
// 🔥 SEND OTP
// ─────────────────────────────────────────
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body
  const cleanEmail = sanitizeString(email)

  if (!cleanEmail) {
    throw new AppError('Email is required', 400)
  }

  const { otp, hashedOtp, otpExpiry } = await generateOTP()

  let user = await User.findOne({ email: cleanEmail })

  if (!user) {
    user = await User.create({
      email: cleanEmail,
      name: 'User',
      username: `user_${Date.now()}`,
      passwordHash: 'temp',
      otp: hashedOtp,
      otpExpiry,
      otpAttempts: 0,
      otpLastSent: new Date(),
      isVerified: false,
    })
  } else {
    user.otp = hashedOtp
    user.otpExpiry = otpExpiry
    user.otpAttempts = 0
    user.otpLastSent = new Date()
    await user.save()
  }

  // 🔥 DEBUG OTP (REMOVE AFTER DEBUG)
  console.log(`🔐 [DEBUG OTP] ${cleanEmail}: ${otp}`)

  const emailResult = await sendOTPEmail(cleanEmail, user.name, otp)

  if (!emailResult.success) {
    console.log('⚠️ Email failed, using console OTP')
  }

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',

    // 🔥 DEV ONLY
    ...(process.env.NODE_ENV !== 'production' && {
      debugOtp: otp,
    }),
  })
}

// ─────────────────────────────────────────
// 🔥 VERIFY OTP
// ─────────────────────────────────────────
export const verifyOTPHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body as VerifyOTPInput

  const user = await User.findOne({ email }).select(
    '+otp +otpExpiry +otpAttempts +isVerified'
  )

  if (!user) throw new AppError('Invalid credentials', 400)

  let isNewUser = false
  if (!user.isVerified) isNewUser = true

  if (!user.otp || !user.otpExpiry) {
    throw new AppError('No OTP found', 400)
  }

  if (user.otpAttempts >= 5) {
    throw new AppError('Too many attempts. Request new OTP.', 400)
  }

  const { valid, expired } = await verifyOTP(otp, user.otp, user.otpExpiry)

  if (expired) {
    user.otp = null as any
    user.otpExpiry = null as any
    user.otpAttempts = 0
    await user.save()
    throw new AppError('OTP expired', 400)
  }

  if (!valid) {
    user.otpAttempts += 1
    await user.save()
    throw new AppError('Invalid OTP', 400)
  }

  // ✅ VERIFIED
  user.isVerified = true
  user.otp = null as any
  user.otpExpiry = null as any
  user.otpAttempts = 0
  user.otpLastSent = null as any
  await user.save()

  const { accessToken, refreshToken } = generateTokens(
    user._id as any,
    user.email
  )

  await saveRefreshToken(user._id as mongoose.Types.ObjectId, refreshToken)

  // 🔥 SET COOKIE
  setAuthCookies(res, accessToken, refreshToken)

  console.log(`✅ User verified: ${email}`)

  res.status(200).json({
    success: true,
    message: 'Email verified',
    data: { user, isNewUser },
  })
}

// ─────────────────────────────────────────
// 🔁 RESEND OTP
// ─────────────────────────────────────────
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    res.status(200).json({
      success: true,
      message: 'If that email exists, a new OTP has been sent.',
    })
    return
  }

  if (user.isVerified) {
    throw new AppError('Email already verified', 400)
  }

  if (!canResendOTP(user.otpLastSent)) {
    const remaining = getResendCooldown(user.otpLastSent)
    throw new AppError(`Wait ${remaining}s before resending OTP`, 429)
  }

  const { otp, hashedOtp, otpExpiry } = await generateOTP()

  user.otp = hashedOtp
  user.otpExpiry = otpExpiry
  user.otpAttempts = 0
  user.otpLastSent = new Date()

  await user.save()

  // 🔥 DEBUG RESEND OTP
  console.log(`🔁 [DEBUG RESEND OTP] ${email}: ${otp}`)

  const emailResult = await sendOTPEmail(email, user.name, otp)

  if (!emailResult.success) {
    console.log('⚠️ Resend email failed')
  }

  res.status(200).json({
    success: true,
    message: 'OTP resent successfully',

    ...(process.env.NODE_ENV !== 'production' && {
      debugOtp: otp,
    }),
  })
}

// ─────────────────────────────────────────
// 🔥 COMPLETE PROFILE
// ─────────────────────────────────────────
export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId

  if (!userId) throw new AppError('Unauthorized', 401)

  const { name, username } = req.body

  const cleanName = sanitizeString(name)
  const cleanUsername = sanitizeString(username).toLowerCase()

  if (!cleanName || !cleanUsername) {
    throw new AppError('Name and username are required', 400)
  }

  const existing = await User.findOne({ username: cleanUsername })

  if (existing && existing._id.toString() !== userId.toString()) {
    throw new AppError('Username already taken', 409)
  }

  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)

  user.name = cleanName
  user.username = cleanUsername

  await user.save()

  res.status(200).json({
    success: true,
    message: 'Profile completed',
    data: { user },
  })
}

// ─────────────────────────────────────────
// 🔥 GET ME
// ─────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId

  if (!userId) {
    throw new AppError('Unauthorized', 401)
  }

  const user = await User.findById(userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.status(200).json({
    success: true,
    data: { user },
  })
}