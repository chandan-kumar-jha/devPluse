import { Router } from 'express'
import {
  register,
  verifyOTPHandler,
  resendOTP,
  login,
  refresh,
  getMe,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller'
import validate from '../middleware/validate'
import authenticate from '../middleware/authenticate'
import { asyncHandler } from '../utils/asyncHandler'
import {
  registerLimiter,
  loginLimiter,
  otpLimiter,
  resendOtpLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
} from '../middleware/rateLimiter'
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../schemas/auth.schema'

const router = Router()

// ── Public routes ──────────────────────────────────────────────────
router.post('/register',
  registerLimiter,
  validate(registerSchema),
  asyncHandler(register) ,
  register,
)

router.post('/verify-otp',
  otpLimiter,
  validate(verifyOTPSchema),
  asyncHandler(verifyOTPHandler),
  verifyOTPHandler
)

router.post('/resend-otp',
  resendOtpLimiter,
  validate(resendOTPSchema),
  asyncHandler(resendOTP),
  resendOTP
)

router.post('/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(login),
  login
)

router.post('/refresh',
  refreshLimiter,
  asyncHandler(refresh),
  refresh
)

router.post('/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword),
  forgotPassword
)

router.post('/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(resetPassword),
  resetPassword
)

// ── Protected routes — require valid accessToken cookie ────────────
router.get('/me',
  authenticate,
  asyncHandler(getMe),
  getMe
)

router.delete('/logout',
  authenticate,
  asyncHandler(logout),
  logout
)

router.delete('/logout-all',
  authenticate,
  asyncHandler(logoutAll),
  logoutAll
)

router.patch('/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(changePassword),
  changePassword
)

export default router