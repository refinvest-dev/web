import { apiFetch } from '@/shared/api/http'
import type { AssetListResponse } from '../model/types'

/** `GET /assets` — Core's public Asset Universe proxy. */
export function listAssets(): Promise<AssetListResponse> {
  return apiFetch<AssetListResponse>('/assets')
}
