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
  loadUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  // 🔥 FIXED: DO NOT BLOCK UI INITIALLY
  isLoading: false,

  error: null,

  setUser: (user) => set({ user, error: null }),

  // 🔥 AUTH LOAD (ONLY WHEN NEEDED)
  loadUser: async () => {
    set({ isLoading: true })

    try {
      const res = await api.get('/auth/me')

      set({
        user: res.data.data.user,
        isLoading: false,
      })
    } catch (err: any) {
      // ✅ 401 = normal (not logged in)
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
        error: 'Something went wrong',
      })
    }
  },

  logout: async () => {
    try {
      await api.delete('/auth/logout')
    } catch {
      // ignore
    }

    set({ user: null })
  },
}))