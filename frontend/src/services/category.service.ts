import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { Category } from '@/types/category'

export const categoryService = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/api/categories')
    return res.data
  },
}
