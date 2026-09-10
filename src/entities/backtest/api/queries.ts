'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getBacktestRun,
  getLatestCompletedBacktestRun,
  listBacktestRuns,
  type ListBacktestRunsParams,
} from './backtest-api'
import { backtestKeys } from './query-keys'

const terminalStatuses = new Set(['COMPLETED', 'FAILED'])

export function useBacktestRunQuery(runId: string | null) {
  return useQuery({
    queryKey: backtestKeys.run(runId ?? ''),
    queryFn: () => getBacktestRun(runId!),
    enabled: Boolean(runId),
    refetchInterval: (query) =>
      query.state.data && terminalStatuses.has(query.state.data.status)
        ? false
        : 2_500,
  })
}

export function useBacktestRunsQuery(
  strategyId: string,
  params: ListBacktestRunsParams = {},
) {
  return useQuery({
    queryKey: backtestKeys.strategyRunList(strategyId, params),
    queryFn: () => listBacktestRuns(strategyId, params),
    enabled: Boolean(strategyId),
  })
}

/**
 * Restores the latest completed result for a strategy version after a direct
 * visit or refresh. Core resolves ownership and `createdAt DESC` ordering,
 * returning null when this version has no completed run.
 */
export function useLatestCompletedBacktestRunQuery(strategyVersionId: string) {
  return useQuery({
    queryKey: backtestKeys.latestCompleted(strategyVersionId),
    queryFn: () => getLatestCompletedBacktestRun(strategyVersionId),
    enabled: Boolean(strategyVersionId),
    select: (response) => response.run,
  })
}
