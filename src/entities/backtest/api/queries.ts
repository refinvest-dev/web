'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getBacktestRun,
  listBacktestRuns,
  type ListBacktestRunsParams,
} from './backtest-api'
import { backtestKeys } from './query-keys'

const terminalStatuses = new Set(['COMPLETED', 'FAILED'])
const latestCompletedRunListParams = { page: 0, size: 100 }

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
 * visit or refresh. The Core contract lists runs by strategy, newest first,
 * so the first matching completed run is the version's latest completed run.
 */
export function useLatestCompletedBacktestRunQuery(
  strategyId: string,
  strategyVersionId: string,
) {
  return useQuery({
    queryKey: backtestKeys.strategyRunList(
      strategyId,
      latestCompletedRunListParams,
    ),
    queryFn: () => listBacktestRuns(strategyId, latestCompletedRunListParams),
    enabled: Boolean(strategyId && strategyVersionId),
    select: (runs) =>
      runs.items.find(
        (run) =>
          run.strategyVersionId === strategyVersionId &&
          run.status === 'COMPLETED',
      ) ?? null,
  })
}
