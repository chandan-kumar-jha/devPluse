import api from '../lib/axios'

// ── Types ──────────────────────────────────────────────────────────
export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
}

export interface VerifyOTPPayload {
  email: string
  otp: string
}

export interface LoginPayload {
  email: string
  password: string
}

// ── API calls ──────────────────────────────────────────────────────
export const registerApi = async (data: RegisterPayload) => {
  const res = await api.post('/auth/register', data)
  return res.data
}

export const verifyOTPApi = async (data: VerifyOTPPayload) => {
  const res = await api.post('/auth/verify-otp', data)
  return res.data
}

export const resendOTPApi = async (email: string) => {
  const res = await api.post('/auth/resend-otp', { email })
  return res.data
}

export const loginApi = async (data: LoginPayload) => {
  const res = await api.post('/auth/login', data)
  return res.data
}

export const getMeApi = async () => {
  const res = await api.get('/auth/me')
  return res.data
}

export const logoutApi = async () => {
  const res = await api.delete('/auth/logout')
  return res.data
}