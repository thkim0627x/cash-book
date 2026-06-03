import apiClient from '@/lib/axios'
import type { ApiResponse, PageResponse } from '@/types/common'
import type {
  Post,
  Comment,
  PostCategory,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
} from '@/types/community'

export interface PostListParams {
  category?: PostCategory | 'ALL'
  page?: number
  size?: number
  sort?: 'latest' | 'popular'
}

export const communityService = {
  getList: async (params: PostListParams = {}): Promise<ApiResponse<PageResponse<Post>>> => {
    const { category, ...rest } = params
    const res = await apiClient.get<ApiResponse<PageResponse<Post>>>('/api/community/posts', {
      params: {
        ...rest,
        ...(category && category !== 'ALL' ? { category } : {}),
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return res.data
  },

  getDetail: async (id: number): Promise<ApiResponse<Post>> => {
    const res = await apiClient.get<ApiResponse<Post>>(`/api/community/posts/${id}`)
    return res.data
  },

  create: async (data: PostCreateRequest): Promise<ApiResponse<Post>> => {
    const res = await apiClient.post<ApiResponse<Post>>('/api/community/posts', data)
    return res.data
  },

  update: async (id: number, data: PostUpdateRequest): Promise<ApiResponse<Post>> => {
    const res = await apiClient.put<ApiResponse<Post>>(`/api/community/posts/${id}`, data)
    return res.data
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/community/posts/${id}`)
    return res.data
  },

  getComments: async (
    postId: number,
    page = 0,
    size = 50
  ): Promise<ApiResponse<PageResponse<Comment>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Comment>>>(
      `/api/community/posts/${postId}/comments`,
      { params: { page, size } }
    )
    return res.data
  },

  createComment: async (
    postId: number,
    data: CommentCreateRequest
  ): Promise<ApiResponse<Comment>> => {
    const res = await apiClient.post<ApiResponse<Comment>>(
      `/api/community/posts/${postId}/comments`,
      data
    )
    return res.data
  },

  deleteComment: async (commentId: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/api/community/comments/${commentId}`
    )
    return res.data
  },

  toggleLike: async (postId: number): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
    const res = await apiClient.post<ApiResponse<{ liked: boolean; likeCount: number }>>(
      `/api/community/posts/${postId}/like`
    )
    return res.data
  },
}
