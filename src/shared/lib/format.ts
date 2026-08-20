/**
 * Shared, presentation-only formatting helpers for numeric and financial data.
 * These operate on already-loaded values; they do not fetch or transform domain data.
 */

export function formatCurrency(
  value: number,
  options: { compact?: boolean; signed?: boolean } = {},
): string {
  const { compact = false, signed = false } = options
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
  }).format(Math.abs(value))

  if (value < 0) return `-${formatted}`
  if (signed && value > 0) return `+${formatted}`
  return formatted
}

export function formatPercent(
  value: number,
  options: { signed?: boolean; digits?: number } = {},
): string {
  const { signed = false, digits = 2 } = options
  const formatted = `${Math.abs(value).toFixed(digits)}%`
  if (value < 0) return `-${formatted}`
  if (signed && value > 0) return `+${formatted}`
  return formatted
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Returns the financial direction of a value for token-based coloring. */
export type Direction = 'positive' | 'negative' | 'neutral'

export function directionOf(value: number): Direction {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}
