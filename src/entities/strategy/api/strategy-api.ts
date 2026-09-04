/**
 * Strategy API functions — the only place that knows the contract's paths and
 * shapes. They return API-boundary types and never touch React.
 */
import { apiFetch } from '@/shared/api/http'
import type {
  CreateStrategyRequest,
  DefineStrategyVersionRequest,
  Page,
  StrategyDetail,
  StrategySummary,
  StrategyVersion,
} from '../model/types'

export interface StrategyPreviewResponse {
  previewText: string
}

export interface ListStrategiesParams {
  page?: number
  size?: number
}

export function listStrategies(
  params: ListStrategiesParams = {},
): Promise<Page<StrategySummary>> {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.size != null) search.set('size', String(params.size))
  const qs = search.toString()
  return apiFetch<Page<StrategySummary>>(`/strategies${qs ? `?${qs}` : ''}`)
}

export function getStrategy(strategyId: string): Promise<StrategyDetail> {
  return apiFetch<StrategyDetail>(
    `/strategies/${encodeURIComponent(strategyId)}`,
  )
}

export function createStrategy(
  body: CreateStrategyRequest,
): Promise<StrategySummary> {
  return apiFetch<StrategySummary>('/strategies', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function defineStrategyVersion(
  strategyId: string,
  body: DefineStrategyVersionRequest,
): Promise<StrategyVersion> {
  return apiFetch<StrategyVersion>(
    `/strategies/${encodeURIComponent(strategyId)}/versions`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}

export function previewStrategyVersion(
  strategyId: string,
  body: DefineStrategyVersionRequest,
): Promise<StrategyPreviewResponse> {
  return apiFetch<StrategyPreviewResponse>(
    `/strategies/${encodeURIComponent(strategyId)}/versions/preview`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}
