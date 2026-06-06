import type { TransactionType } from './category'

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  memo: string | null
  txnDate: string // 'YYYY-MM-DD'
  categoryId: number
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
  assetId: number | null
  assetName: string | null
}

export interface TransactionCreateRequest {
  type: TransactionType
  categoryId: number
  amount: number
  txnDate: string
  memo?: string
  assetId?: number
}

export interface TransactionUpdateRequest {
  categoryId: number
  amount: number
  txnDate: string
  memo?: string
  assetId?: number
}

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  balance: number
}
