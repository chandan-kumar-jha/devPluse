import rateLimit from 'express-rate-limit'

// ── Helper — consistent error response shape ───────────────────────
const rateLimitHandler = (message: string) =>
  rateLimit({
    standardHeaders: true,  // sends RateLimit headers to client
    legacyHeaders: false,   // disable X-RateLimit headers
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
      })
    },
  })

// ── Auth limiters ──────────────────────────────────────────────────

// POST /auth/register — 5 attempts per hour per IP
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Try again in an hour.',
    })
  },
})

// POST /auth/login — 10 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Try again in 15 minutes.',
    })
  },
})

// POST /auth/verify-otp — 10 attempts per 15 minutes per IP
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many OTP attempts. Try again in 15 minutes.',
    })
  },
})

// POST /auth/resend-otp — 3 attempts per 15 minutes per IP
export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many resend attempts. Try again in 15 minutes.',
    })
  },
})

// POST /auth/forgot-password — 5 attempts per hour per IP
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Try again in an hour.',
    })
  },
})

// POST /auth/refresh — 20 attempts per 15 minutes per IP
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many refresh attempts. Try again in 15 minutes.',
    })
  },
})

// ── Feature limiters ───────────────────────────────────────────────

// PATCH /profile/me — 20 per hour per user
export const profileUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many profile updates. Try again in an hour.',
    })
  },
})

// POST /profile/avatar — 10 per hour per user
export const avatarUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many avatar uploads. Try again in an hour.',
    })
  },
})

// GET /settings/export — 5 per day per user
export const exportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Export limit reached. Try again tomorrow.',
    })
  },
})