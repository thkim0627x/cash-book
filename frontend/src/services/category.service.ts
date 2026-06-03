import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/types/category'

export const categoryService = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/api/categories')
    return res.data
  },

  create: async (data: CategoryCreateRequest): Promise<ApiResponse<Category>> => {
    const res = await apiClient.post<ApiResponse<Category>>('/api/categories', data)
    return res.data
  },

  update: async (id: number, data: CategoryUpdateRequest): Promise<ApiResponse<Category>> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/api/categories/${id}`, data)
    return res.data
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/categories/${id}`)
    return res.data
  },
}
