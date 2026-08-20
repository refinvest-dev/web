/**
 * Strategy Version — API-boundary types and view helpers.
 *
 * Per the core-api contract, `StrategyVersion` is a standalone schema that
 * `StrategyDetail` aggregates; there is no independent version fetch endpoint,
 * so versions are always read from `GET /strategies/{strategyId}`. The domain
 * types are sourced canonically from the Strategy contract types (no
 * duplication) and re-exported as this slice's public API.
 */
import type { StrategyVersion } from '@/entities/strategy/model/types'

export type {
  AssetSymbol,
  StrategyCondition,
  StrategyVersion,
  StrategyVersionExit,
} from '@/entities/strategy/model/types'

/** True when the version is the strategy's current/latest version. */
export function isLatestVersion(
  version: Pick<StrategyVersion, 'id'>,
  latestVersionId: string | null,
): boolean {
  return latestVersionId != null && version.id === latestVersionId
}

/** Newest-first ordering for display. Does not mutate the input. */
export function orderVersionsByRecency<
  T extends Pick<StrategyVersion, 'createdAt'>,
>(versions: T[]): T[] {
  return [...versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
