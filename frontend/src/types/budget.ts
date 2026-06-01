export interface Budget {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string | null
  categoryIcon: string | null
  limitAmount: number
  year: number
  month: number
}

export interface BudgetCreateRequest {
  categoryId: number
  limitAmount: number
  year: number
  month: number
}

export interface BudgetUpdateRequest {
  limitAmount: number
}

/** 예산 + 실제 지출 결합 뷰 모델 (클라이언트 계산) */
export interface BudgetWithUsage extends Budget {
  usedAmount: number   // 해당 카테고리 당월 실제 지출
  percentage: number   // usedAmount / limitAmount * 100 (capped display용)
  isOver: boolean
}
