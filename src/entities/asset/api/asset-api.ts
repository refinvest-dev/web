import { apiFetch } from '@/shared/api/http'
import type { AssetAvailability, AssetListResponse } from '../model/types'

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
