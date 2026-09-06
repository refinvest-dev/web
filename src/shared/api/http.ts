/**
 * Shared HTTP client — the single boundary between the web app and the
 * Core public API (`core-api` OpenAPI contract).
 *
 * UI components never call this directly; entity API functions do
 * (Component -> Hook -> API function -> HTTP client -> Backend).
 *
 * The base URL is configured per environment and must point to Core's public
 * API. The Web app never falls back to a local API implementation.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')

/** Builds a URL for a Core public API path. */
export function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must point to the Core public API.')
  }
  return `${API_BASE_URL}${path}`
}

type RefreshResult = 'refreshed' | 'unauthenticated' | 'csrf-rejected' | 'unavailable'

let refreshPromise: Promise<RefreshResult> | undefined

function csrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const prefix = 'XSRF-TOKEN='
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix))
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null
}

async function ensureCsrfToken(forceRenewal = false): Promise<string> {
  const currentToken = csrfTokenFromCookie()
  if (currentToken && !forceRenewal) return currentToken

  let response: Response
  try {
    response = await fetch(getApiUrl('/auth/csrf'), {
      credentials: 'include',
    })
  } catch {
    throw new ApiError('Network error — could not prepare the request.', 0)
  }

  if (!response.ok) {
    throw new ApiError('Could not prepare the request. Please try again.', response.status)
  }

  const issuedToken = csrfTokenFromCookie()
  if (!issuedToken) {
    throw new ApiError('Could not prepare the request. Please refresh and try again.', 0)
  }
  return issuedToken
}

/** Normalized error thrown for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number
  /** Present for Core's general `ErrorResponse`. */
  readonly code?: string
  /** Present for `StrategyVersionValidationError` (domain invariant violations). */
  readonly violations?: string[]

  constructor(
    message: string,
    status: number,
    violations?: string[],
    code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.violations = violations
    this.code = code
  }
}

async function refreshAccessSession(): Promise<RefreshResult> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      // A stale CSRF cookie must not turn an expired session into a 403.
      const csrfToken = await ensureCsrfToken(true)
      const response = await fetch(getApiUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
      })
      if (response.ok) return 'refreshed'
      if (response.status === 401) return 'unauthenticated'
      if (response.status === 403) return 'csrf-rejected'
      return 'unavailable'
    } catch {
      return 'unavailable'
    } finally {
      refreshPromise = undefined
    }
  })()

  return refreshPromise
}

function redirectToLogin() {
  if (typeof window === 'undefined' || window.location.pathname === '/login') return

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`)
}

function shouldRefresh(path: string) {
  return !['/auth/csrf', '/auth/refresh', '/auth/logout'].includes(path)
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const csrfToken =
    method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
      ? null
      : await ensureCsrfToken()

  const request = () => fetch(getApiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
      ...init?.headers,
    },
  })

  let res: Response
  try {
    res = await request()
  } catch {
    throw new ApiError('Network error — could not reach the server.', 0)
  }

  if (res.status === 401 && shouldRefresh(path)) {
    const refreshResult = await refreshAccessSession()
    if (refreshResult === 'refreshed') {
      try {
        res = await request()
      } catch {
        throw new ApiError('Network error — could not reach the server.', 0)
      }
    }
    if (
      refreshResult === 'unauthenticated' ||
      (refreshResult === 'refreshed' && res.status === 401)
    ) {
      redirectToLogin()
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`
    let violations: string[] | undefined
    let code: string | undefined
    try {
      const body = (await res.json()) as {
        message?: string
        code?: string
        violations?: string[]
      }
      if (body?.message) message = body.message
      if (typeof body?.code === 'string') code = body.code
      if (Array.isArray(body?.violations)) violations = body.violations
    } catch {
      // Non-JSON error body — keep the default message.
    }
    throw new ApiError(message, res.status, violations, code)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
