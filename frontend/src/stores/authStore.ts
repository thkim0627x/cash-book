import { create } from 'zustand'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string, persistent?: boolean) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken, persistent = true) => {
    if (typeof window !== 'undefined') {
      const storage = persistent ? localStorage : sessionStorage
      storage.setItem('accessToken', accessToken)
      storage.setItem('refreshToken', refreshToken)
      // 자동로그인 여부 기록 (인터셉터에서 참조)
      localStorage.setItem('autoLogin', persistent ? '1' : '0')
    }
    set({ user, isAuthenticated: true })
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
    }
    set({ user: null, isAuthenticated: false })
  },
}))
