import { Response, CookieOptions } from 'express'
import { env } from '../config/env'

// ── ENV ─────────────────────────────────────────────
const isProduction = env.NODE_ENV === 'production'

// ✅ FORCE correct type
const sameSite: CookieOptions['sameSite'] = isProduction ? 'none' : 'lax'

// ── BASE COOKIE ─────────────────────────────────────
const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite,              // ✅ typed correctly
  secure: isProduction,  // ✅ required for production
  path: '/',
}

// ── ACCESS TOKEN ────────────────────────────────────
const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000,
}

// ── REFRESH TOKEN ───────────────────────────────────
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh', // ✅ IMPORTANT (fix path)
}

// ── SET COOKIES ─────────────────────────────────────
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS)
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
}

// ── CLEAR COOKIES ───────────────────────────────────
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', BASE_COOKIE_OPTIONS)

  res.clearCookie('refreshToken', {
    ...BASE_COOKIE_OPTIONS,
    path: '/api/auth/refresh', // must match exactly
  })
}