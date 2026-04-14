import { create } from 'zustand'
import { api } from '../api/axios'

interface User {
  id: string
  name: string
  email: string
  username: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  loadUser: () => Promise<void> // 🔥 ADD THIS
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // 🔥 VERY IMPORTANT (was false)
  error: null,

  setUser: (user) => set({ user, error: null }),

  // 🔥 NEW — AUTH PERSISTENCE
  loadUser: async () => {
  try {
    const res = await api.get('/auth/me')

    set({
      user: res.data.data.user,
      isLoading: false,
    })
  } catch (err: any) {
    // 🔥 CRITICAL FIX
    if (err?.response?.status === 401) {
      set({
        user: null,
        isLoading: false,
      })
      return
    }

    set({
      user: null,
      isLoading: false,
    })
  }
}
,
  logout: async () => {
    try {
      await api.delete('/auth/logout')
    } catch { /* empty */ }

    set({ user: null })
  },
}))

