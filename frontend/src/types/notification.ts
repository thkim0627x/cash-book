export type NotificationType =
  | 'BUDGET_WARNING'   // 예산 경고
  | 'BENEFIT_DEADLINE' // 혜택 마감
  | 'COMMENT'          // 댓글 알림

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  linkUrl: string | null
  isRead: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}
