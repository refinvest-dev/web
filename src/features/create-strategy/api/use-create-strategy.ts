'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createStrategy } from '@/entities/strategy/api/strategy-api'
import { strategyKeys } from '@/entities/strategy/api/query-keys'
import type { StrategySummary } from '@/entities/strategy/model/types'

/**
 * Creates a strategy and reconciles server state:
 * - invalidates the list so it refetches
 * - seeds the new strategy's detail cache (read-your-writes on navigation)
 */
export function useCreateStrategy(options?: {
  onCreated?: (created: StrategySummary) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStrategy,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() })
      queryClient.setQueryData(strategyKeys.detail(created.id), {
        ...created,
        versions: [],
      })
      options?.onCreated?.(created)
    },
  })
}
