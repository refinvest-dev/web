/**
 * Shared HTTP client — the single boundary between the web app and the
 * Core public API (`core-api` OpenAPI contract).
 *
 * UI components never call this directly; entity API functions do
 * (Component -> Hook -> API function -> HTTP client -> Backend).
 *
 * The base URL is configurable so the app can target the real Core API in
 * any environment. It defaults to the same-origin `/api` route handlers,
 * which implement the contract for local/preview development.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '/api'

function csrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const prefix = 'XSRF-TOKEN='
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix))
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null
}

async function ensureCsrfToken(): Promise<string> {
  const currentToken = csrfTokenFromCookie()
  if (currentToken) return currentToken

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/auth/csrf`, {
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
  /** Present for `StrategyVersionValidationError` (domain invariant violations). */
  readonly violations?: string[]

  constructor(message: string, status: number, violations?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.violations = violations
  }
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

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError('Network error — could not reach the server.', 0)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`
    let violations: string[] | undefined
    try {
      const body = (await res.json()) as {
        message?: string
        violations?: string[]
      }
      if (body?.message) message = body.message
      if (Array.isArray(body?.violations)) violations = body.violations
    } catch {
      // Non-JSON error body — keep the default message.
    }
    throw new ApiError(message, res.status, violations)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
