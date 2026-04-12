import { Router } from 'express'

import {
  sendOTP,
  verifyOTPHandler,
  resendOTP,
  completeProfile,
  getMe,
} from '../controllers/auth.controller'

import validate from '../middleware/validate'
import authenticate from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

import {
  otpLimiter,
  resendOtpLimiter,
} from '../middleware/rateLimiter'

import {
  verifyOTPSchema,
  resendOTPSchema,
} from '../schemas/auth.schema'

const router = Router()

// 🔥 SEND OTP
router.post(
  '/send-otp',
  otpLimiter,
  asyncHandler(sendOTP)
)

// 🔥 VERIFY OTP
router.post(
  '/verify-otp',
  otpLimiter,
  validate(verifyOTPSchema),
  asyncHandler(verifyOTPHandler)
)

// 🔁 RESEND OTP
router.post(
  '/resend-otp',
  resendOtpLimiter,
  validate(resendOTPSchema),
  asyncHandler(resendOTP)
)

// 🔥 COMPLETE PROFILE (protected)
router.post(
  '/complete-profile',
  authenticate,
  asyncHandler(completeProfile)
)

// 🔥 GET ME (protected)
router.get(
  '/me',
  authenticate,
  asyncHandler(getMe)
)

export default router