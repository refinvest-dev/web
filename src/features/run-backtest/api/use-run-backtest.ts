'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runBacktest } from '@/entities/backtest/api/backtest-api'
import { backtestKeys } from '@/entities/backtest/api/query-keys'
import type {
  BacktestRunSummary,
  RunBacktestRequest,
} from '@/entities/backtest/model/types'

export function useRunBacktest(options?: {
  onAccepted?: (run: BacktestRunSummary) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      strategyVersionId,
      body,
    }: {
      strategyVersionId: string
      body: RunBacktestRequest
    }) => runBacktest(strategyVersionId, body),
    onSuccess: (run) => {
      queryClient.invalidateQueries({
        queryKey: backtestKeys.runs(),
      })
      queryClient.invalidateQueries({
        queryKey: backtestKeys.strategyRuns(),
      })
      queryClient.setQueryData(backtestKeys.run(run.id), run)
      options?.onAccepted?.(run)
    },
  })
}
