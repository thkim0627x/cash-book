import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { User, ProfileUpdateRequest, PasswordChangeRequest } from '@/types/auth'

export const userService = {
  updateProfile: async (data: ProfileUpdateRequest): Promise<ApiResponse<User>> => {
    const res = await apiClient.put<ApiResponse<User>>('/api/users/me', data)
    return res.data
  },

  changePassword: async (data: PasswordChangeRequest): Promise<ApiResponse<null>> => {
    const res = await apiClient.put<ApiResponse<null>>('/api/users/me/password', data)
    return res.data
  },
}
