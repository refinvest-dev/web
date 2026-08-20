'use client'

import { useQuery } from '@tanstack/react-query'
import { getStrategy } from '@/entities/strategy/api/strategy-api'
import { strategyKeys } from '@/entities/strategy/api/query-keys'
import type { StrategyVersion } from '@/entities/strategy/model/types'
import { isLatestVersion } from '../model/types'

export interface StrategyVersionView {
  /** null when the version id doesn't belong to the strategy. */
  version: StrategyVersion | null
  isLatest: boolean
  strategyId: string
  strategyName: string
}

/**
 * Reads a single StrategyVersion by deriving it from the Strategy detail
 * response — the contract exposes no standalone version endpoint. Shares the
 * `strategyKeys.detail` cache with `useStrategyQuery`, so opening a version
 * from the strategy detail page reuses already-loaded data and never
 * duplicates server state.
 */
export function useStrategyVersionQuery(strategyId: string, versionId: string) {
  return useQuery({
    queryKey: strategyKeys.detail(strategyId),
    queryFn: () => getStrategy(strategyId),
    enabled: Boolean(strategyId && versionId),
    select: (detail): StrategyVersionView => ({
      version: detail.versions.find((v) => v.id === versionId) ?? null,
      isLatest: isLatestVersion({ id: versionId }, detail.latestVersionId),
      strategyId: detail.id,
      strategyName: detail.name,
    }),
  })
}
