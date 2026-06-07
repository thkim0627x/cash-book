import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string, persistent?: boolean) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken, persistent = true) => {
        if (typeof window !== 'undefined') {
          const storage = persistent ? localStorage : sessionStorage
          storage.setItem('accessToken', accessToken)
          storage.setItem('refreshToken', refreshToken)
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
    }),
    {
      name: 'planday-auth',
      storage: createJSONStorage(() => sessionStorage), // 탭 종료 시 자동 삭제
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
