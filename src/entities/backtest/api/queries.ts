'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getBacktestRun,
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
