export interface Budget {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string | null
  categoryIcon: string | null
  amount: number
  spent: number
  remaining: number
  yearMonth: string
}

export interface BudgetCreateRequest {
  categoryId: number | null
  amount: number
  yearMonth: string
}

export interface BudgetUpdateRequest {
  amount: number
}

export interface BudgetWithUsage extends Budget {
  usedAmount: number
  percentage: number
  isOver: boolean
}
