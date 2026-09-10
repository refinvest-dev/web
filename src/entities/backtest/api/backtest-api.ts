import { apiFetch } from '@/shared/api/http'
import type {
  BacktestRunDetail,
  BacktestRunSummary,
  RunBacktestRequest,
} from '../model/types'
import type { Page } from '@/entities/strategy/model/types'

export interface ListBacktestRunsParams {
  page?: number
  size?: number
}

/** `GET /strategy-versions/{versionId}/backtest-runs/latest-completed` response. */
export interface LatestCompletedBacktestRunResponse {
  run: BacktestRunSummary | null
}

export function runBacktest(
  strategyVersionId: string,
  body: RunBacktestRequest,
): Promise<BacktestRunSummary> {
  return apiFetch<BacktestRunSummary>(
    `/strategy-versions/${encodeURIComponent(strategyVersionId)}/backtests`,
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export function getBacktestRun(runId: string): Promise<BacktestRunDetail> {
  return apiFetch<BacktestRunDetail>(
    `/backtest-runs/${encodeURIComponent(runId)}`,
  )
}

export function getLatestCompletedBacktestRun(
  strategyVersionId: string,
): Promise<LatestCompletedBacktestRunResponse> {
  return apiFetch<LatestCompletedBacktestRunResponse>(
    `/strategy-versions/${encodeURIComponent(strategyVersionId)}/backtest-runs/latest-completed`,
  )
}

export function listBacktestRuns(
  strategyId: string,
  params: ListBacktestRunsParams = {},
): Promise<Page<BacktestRunSummary>> {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.size != null) search.set('size', String(params.size))
  const query = search.toString()
  return apiFetch<Page<BacktestRunSummary>>(
    `/strategies/${encodeURIComponent(strategyId)}/backtest-runs${
      query ? `?${query}` : ''
    }`,
  )
}
