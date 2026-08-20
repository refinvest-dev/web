/**
 * Strategy API-boundary types — mirror the `core-api` OpenAPI contract exactly.
 * No fields are added beyond the contract. Compute-domain types referenced by
 * the contract (Condition, etc.) are opaque at this boundary.
 */

export type AssetSymbol = string

/** `compute-api` Condition — opaque to the web app. */
export type StrategyCondition = unknown

export interface StrategySummary {
  id: string
  name: string
  createdAt: string
  /** null when the strategy has no StrategyVersion yet. */
  latestVersionId: string | null
}

export interface StrategyVersionExit {
  holdingSignalSessions: number
}

/** Request body for `POST /strategies/{strategyId}/versions`. */
export interface DefineStrategyVersionRequest {
  primarySignalAsset: AssetSymbol
  conditions: StrategyCondition[]
  executionAsset: AssetSymbol
  lag: number
  exit: StrategyVersionExit
}

export interface StrategyVersion {
  id: string
  strategyId: string
  createdAt: string
  primarySignalAsset: DefineStrategyVersionRequest['primarySignalAsset']
  conditions: DefineStrategyVersionRequest['conditions']
  executionAsset: DefineStrategyVersionRequest['executionAsset']
  lag: DefineStrategyVersionRequest['lag']
  exit: DefineStrategyVersionRequest['exit']
}

export interface StrategyDetail extends StrategySummary {
  versions: StrategyVersion[]
}

/** Offset-based pagination envelope shared by list endpoints. */
export interface Page<T> {
  items: T[]
  page: number
  size: number
  total: number
}

export interface CreateStrategyRequest {
  name: string
}

/** UI-facing configuration state derived from the contract's `latestVersionId`. */
export type StrategyConfigState = 'configured' | 'draft'

export function strategyConfigState(
  strategy: Pick<StrategySummary, 'latestVersionId'>,
): StrategyConfigState {
  return strategy.latestVersionId ? 'configured' : 'draft'
}
