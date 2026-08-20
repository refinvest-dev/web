import type { ListStrategiesParams } from './strategy-api'

/** Centralized query-key factory for the Strategy entity. */
export const strategyKeys = {
  all: ['strategies'] as const,
  lists: () => [...strategyKeys.all, 'list'] as const,
  list: (params: ListStrategiesParams) =>
    [...strategyKeys.lists(), params] as const,
  details: () => [...strategyKeys.all, 'detail'] as const,
  detail: (strategyId: string) =>
    [...strategyKeys.details(), strategyId] as const,
}
