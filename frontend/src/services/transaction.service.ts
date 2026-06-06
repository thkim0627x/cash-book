import apiClient from '@/lib/axios'
import type { ApiResponse, PageResponse } from '@/types/common'
import type {
  Transaction,
  TransactionCreateRequest,
  TransactionUpdateRequest,
  TransactionSummary,
} from '@/types/transaction'

export interface TransactionListParams {
  year: number
  month: number
  page?: number
  size?: number
}

export const transactionService = {
  getList: async (
    params: TransactionListParams
  ): Promise<ApiResponse<PageResponse<Transaction>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Transaction>>>(
      '/api/transactions',
      { params: { ...params, page: params.page ?? 0, size: params.size ?? 20 } }
    )
    return res.data
  },

  create: async (data: TransactionCreateRequest): Promise<ApiResponse<Transaction>> => {
    const res = await apiClient.post<ApiResponse<Transaction>>('/api/transactions', data)
    return res.data
  },

  update: async (id: number, data: TransactionUpdateRequest): Promise<ApiResponse<Transaction>> => {
    const res = await apiClient.put<ApiResponse<Transaction>>(`/api/transactions/${id}`, data)
    return res.data
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/transactions/${id}`)
    return res.data
  },

  getAllTimeSummary: async (): Promise<ApiResponse<{ totalIncome: number; totalExpense: number; balance: number }>> => {
    const res = await apiClient.get('/api/transactions/summary/alltime')
    return res.data
  },

  getSummary: (transactions: Transaction[]): TransactionSummary => {
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  },
}
