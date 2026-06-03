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

export interface CategoryCreateRequest {
  name: string
  type: TransactionType
  color: string
}

export interface CategoryUpdateRequest {
  name: string
  color: string
}

// 카테고리 색상 팔레트 (12색 프리셋)
export const CATEGORY_COLORS = [
  '#EF5350', '#EC407A', '#AB47BC', '#7E57C2',
  '#5C6BC0', '#42A5F5', '#26A69A', '#66BB6A',
  '#9CCC65', '#FFA726', '#FF7043', '#8D6E63',
] as const
