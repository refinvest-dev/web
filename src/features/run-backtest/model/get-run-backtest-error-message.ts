import { ApiError } from '@/shared/api/http'

export function getRunBacktestErrorMessage(error: Error | null): string | null {
  if (!error) return null
  if (!(error instanceof ApiError)) return 'Could not start the backtest. Please try again.'

  switch (error.code) {
    case 'BACKTEST_PERIOD_NOT_ALLOWED':
      return 'This backtest period is not available for your current plan.'
    case 'ASSET_NOT_ALLOWED_FOR_PLAN':
      return 'One or more Assets in this strategy are not available for your current plan.'
    case 'BACKTEST_MONTHLY_LIMIT_EXCEEDED':
      return 'You have reached this month’s backtest limit for your current plan.'
    case 'BACKTEST_CONCURRENCY_LIMIT_EXCEEDED':
      return 'You already have the maximum number of backtests running. Try again when one finishes.'
    default:
      return 'Could not start the backtest. Please try again.'
  }
}
