import { Response } from 'express'
import { env } from '../config/env'

// ── Cookie config ──────────────────────────────────────────────────
const isProduction = env.NODE_ENV === 'production'

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,                    // JS cannot read — blocks XSS
   sameSite: isProduction ? ('strict' as const) : ('none' as const),        // blocks CSRF
}

// ── Access token cookie — 15 minutes ──────────────────────────────
const ACCESS_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000,            // 15 min in milliseconds
}

// ── Refresh token cookie — 7 days ─────────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
  path: '/auth/refresh',             // only sent to refresh endpoint
}

// ── Set both cookies ───────────────────────────────────────────────
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS)
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
}

// ── Clear both cookies ─────────────────────────────────────────────
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
  })
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/auth/refresh',           // must match the path it was set with
  })
}