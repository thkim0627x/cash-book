import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { LoginRequest, RegisterRequest, AuthTokens } from '@/types/auth'

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthTokens>> => {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/api/auth/login', data)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/api/auth/register', data)
    return res.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
  },
}
