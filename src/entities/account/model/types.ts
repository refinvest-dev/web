/** API-boundary types for Core's account and subscription endpoints. */
export type SubscriptionTier = 'FREE' | 'PRO'

export interface Usage {
  tier: SubscriptionTier
  backtestsUsedThisMonth: number
  backtestMonthlyLimit: number
  allowedAssets: string[]
  maxBacktestPeriodDays: number
}
