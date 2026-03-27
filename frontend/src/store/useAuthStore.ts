// src/store/useAuthStore.ts
import { create } from 'zustand';
import { api } from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  setUser: (user: User | null) => void; // Added this
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Synchronous action to update user (used after OTP verification)
  setUser: (user) => set({ 
    user, 
    error: null 
  }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      // Backend returns { success: true, data: { user } }
      set({ user: response.data.data.user, isLoading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.delete('/logout');
      set({ user: null });
    } catch (err) {
      console.error('Logout failed', err);
    }
  },
}));