export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Category {
  id: number
  name: string
  type: TransactionType
  icon: string | null
  color: string | null
  isDefault: boolean
  sortOrder: number
}
