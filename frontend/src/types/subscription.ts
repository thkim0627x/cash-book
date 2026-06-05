export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'WEEKLY'

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: '월간',
  YEARLY: '연간',
  WEEKLY: '주간',
}

export interface Subscription {
  id: number
  name: string
  startDate: string
  billingCycle: BillingCycle
  amount: number
  nextBillingDayOfMonth: number | null
  createdAt: string
}

export interface SubscriptionRequest {
  name: string
  startDate: string
  billingCycle: BillingCycle
  amount: number
}
