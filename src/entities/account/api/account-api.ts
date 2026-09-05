import { apiFetch, getApiUrl } from '@/shared/api/http'
import type { Usage } from '../model/types'

/** `GET /me/usage` — current tier policy and UTC-month backtest usage. */
export function getUsage(): Promise<Usage> {
  return apiFetch<Usage>('/me/usage')
}

export type SocialProvider = 'kakao' | 'naver' | 'google'

export function getSocialLoginUrl(provider: SocialProvider, returnTo: string): string {
  const params = new URLSearchParams({ returnTo })
  return getApiUrl(`/oauth2/authorization/${provider}?${params}`)
}

/** `POST /auth/logout` — invalidate the current Refresh Token family. */
export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}
