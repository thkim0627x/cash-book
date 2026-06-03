import apiClient from '@/lib/axios'
import type { ApiResponse, PageResponse } from '@/types/common'
import type { Notification, UnreadCountResponse } from '@/types/notification'

export const notificationService = {
  getList: async (page = 0, size = 30): Promise<ApiResponse<PageResponse<Notification>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Notification>>>(
      '/api/notifications',
      { params: { page, size } }
    )
    return res.data
  },

  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
    const res = await apiClient.get<ApiResponse<UnreadCountResponse>>(
      '/api/notifications/unread-count'
    )
    return res.data
  },

  markRead: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.patch<ApiResponse<null>>(
      `/api/notifications/${id}/read`
    )
    return res.data
  },

  markAllRead: async (): Promise<ApiResponse<null>> => {
    const res = await apiClient.patch<ApiResponse<null>>('/api/notifications/read-all')
    return res.data
  },
}
