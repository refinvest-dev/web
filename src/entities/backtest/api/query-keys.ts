import type { ListBacktestRunsParams } from './backtest-api'

export const backtestKeys = {
  all: ['backtests'] as const,
  runs: () => [...backtestKeys.all, 'run'] as const,
  run: (runId: string) => [...backtestKeys.runs(), runId] as const,
  latestCompleted: (strategyVersionId: string) =>
    [...backtestKeys.runs(), 'latest-completed', strategyVersionId] as const,
  strategyRuns: () => [...backtestKeys.all, 'strategy'] as const,
  strategyRunList: (strategyId: string, params: ListBacktestRunsParams) =>
    [...backtestKeys.strategyRuns(), strategyId, params] as const,
}
