import { apiFetch } from '@/shared/api/http'
import type { Usage } from '../model/types'

/** `GET /me/usage` — current tier policy and UTC-month backtest usage. */
export function getUsage(): Promise<Usage> {
  return apiFetch<Usage>('/me/usage')
}
