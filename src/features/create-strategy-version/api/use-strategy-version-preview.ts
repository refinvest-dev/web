'use client'

import { useQuery } from '@tanstack/react-query'
import { previewStrategyVersion } from '@/entities/strategy/api/strategy-api'
import type { DefineStrategyVersionRequest } from '@/entities/strategy/model/types'

export function useStrategyVersionPreview(
  strategyId: string,
  body: DefineStrategyVersionRequest | null,
) {
  return useQuery({
    queryKey: ['strategy-version-preview', strategyId, body] as const,
    queryFn: () => previewStrategyVersion(strategyId, body!),
    enabled: Boolean(strategyId && body),
    retry: false,
  })
}
