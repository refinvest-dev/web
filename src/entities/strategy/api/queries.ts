'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getStrategy,
  listStrategies,
  type ListStrategiesParams,
} from './strategy-api'
import { strategyKeys } from './query-keys'

export function useStrategiesQuery(params: ListStrategiesParams = {}) {
  return useQuery({
    queryKey: strategyKeys.list(params),
    queryFn: () => listStrategies(params),
    placeholderData: keepPreviousData,
  })
}

export function useStrategyQuery(strategyId: string) {
  return useQuery({
    queryKey: strategyKeys.detail(strategyId),
    queryFn: () => getStrategy(strategyId),
    enabled: Boolean(strategyId),
  })
}
