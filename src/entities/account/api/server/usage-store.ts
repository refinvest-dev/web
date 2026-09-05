import type { Usage } from '../../model/types'

/**
 * Local development fixture for Core's `GET /me/usage` contract.
 * Real environments use Core through `NEXT_PUBLIC_API_BASE_URL` instead.
 */
const usage: Usage = {
  tier: 'FREE',
  backtestsUsedThisMonth: 4,
  backtestMonthlyLimit: 30,
  allowedAssets: ['QQQ', 'SPY', 'BTCUSDT'],
  maxBacktestPeriodDays: 365,
}

export function getUsage() {
  return usage
}
