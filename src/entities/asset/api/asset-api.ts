import { apiFetch } from '@/shared/api/http'
import type { AssetAvailability, AssetListResponse, SeriesMetric, SeriesResponse } from '../model/types'

/** `GET /assets` — Core's public Asset Universe proxy. */
export function listAssets(): Promise<AssetListResponse> {
  return apiFetch<AssetListResponse>('/assets')
}

/** `GET /assets/{symbol}/availability` — published data range for an Asset. */
export function getAssetAvailability(symbol: string): Promise<AssetAvailability> {
  return apiFetch<AssetAvailability>(
    `/assets/${encodeURIComponent(symbol)}/availability`,
  )
}

export function getSeries(params: {
  symbols: string[]
  metric: SeriesMetric
  start: string
  end: string
}): Promise<SeriesResponse> {
  const search = new URLSearchParams({
    symbols: params.symbols.join(','), metric: params.metric, start: params.start, end: params.end,
  })
  return apiFetch<SeriesResponse>(`/assets/series?${search}`)
}
