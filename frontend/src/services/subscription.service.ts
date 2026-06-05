import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { Subscription, SubscriptionRequest } from '@/types/subscription'

export const subscriptionService = {
  getAll: async (): Promise<ApiResponse<Subscription[]>> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>('/api/subscriptions')
    return res.data
  },

  create: async (data: SubscriptionRequest): Promise<ApiResponse<Subscription>> => {
    const res = await apiClient.post<ApiResponse<Subscription>>('/api/subscriptions', data)
    return res.data
  },

  update: async (id: number, data: SubscriptionRequest): Promise<ApiResponse<Subscription>> => {
    const res = await apiClient.put<ApiResponse<Subscription>>(`/api/subscriptions/${id}`, data)
    return res.data
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/subscriptions/${id}`)
    return res.data
  },
}
