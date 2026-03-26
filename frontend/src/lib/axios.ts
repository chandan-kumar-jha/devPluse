import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // sends httpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Response interceptor — silent token refresh ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // if 401 and not already retrying and not a refresh/login request
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true

      try {
        // attempt silent refresh
        await api.post('/auth/refresh')
        // retry original request
        return api(originalRequest)
      } catch {
        // refresh failed — redirect to login
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api