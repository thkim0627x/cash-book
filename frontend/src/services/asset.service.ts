import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { Asset, AssetRequest } from '@/types/asset'

export const assetService = {
  getAll: async (): Promise<ApiResponse<Asset[]>> => {
    const res = await apiClient.get<ApiResponse<Asset[]>>('/api/assets')
    return res.data
  },

  create: async (data: AssetRequest): Promise<ApiResponse<Asset>> => {
    const res = await apiClient.post<ApiResponse<Asset>>('/api/assets', data)
    return res.data
  },

  update: async (id: number, data: AssetRequest): Promise<ApiResponse<Asset>> => {
    const res = await apiClient.put<ApiResponse<Asset>>(`/api/assets/${id}`, data)
    return res.data
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/assets/${id}`)
    return res.data
  },
}
