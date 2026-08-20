'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { defineStrategyVersion } from '@/entities/strategy/api/strategy-api'
import { strategyKeys } from '@/entities/strategy/api/query-keys'
import type {
  DefineStrategyVersionRequest,
  StrategyVersion,
} from '@/entities/strategy/model/types'

export function useCreateStrategyVersion(options?: {
  onCreated?: (created: StrategyVersion) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      strategyId,
      body,
    }: {
      strategyId: string
      body: DefineStrategyVersionRequest
    }) => defineStrategyVersion(strategyId, body),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.detail(created.strategyId),
      })
      options?.onCreated?.(created)
    },
  })
}
