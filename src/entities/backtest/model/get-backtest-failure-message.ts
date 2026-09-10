import type { FatalErrorCode } from './types'

export function getBacktestFailureMessage(errorCode?: FatalErrorCode | null): string {
  switch (errorCode) {
    case 'MISSING_REQUIRED_DATA':
    case 'PRICE_DATA_MISSING':
      return 'Required market data was unavailable for this backtest period. Choose a different date range and try again.'
    case 'DATASET_CORRUPTION':
      return 'The market data could not be read for this backtest. Please try again later.'
    case 'CALENDAR_RESOLUTION_FAILED':
      return 'The trading calendar could not be resolved for this backtest. Please choose another date range and try again.'
    case 'EXECUTION_TIMEOUT':
      return 'This backtest took too long to finish. Try a shorter date range and run it again.'
    case 'DSL_INVALID':
      return 'This strategy could not be evaluated. Review the strategy conditions and try again.'
    default:
      return 'The backtest could not be completed. Please try again.'
  }
}
