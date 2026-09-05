'use client'

import { useQuery } from '@tanstack/react-query'
import { getUsage } from './account-api'
import { accountKeys } from './query-keys'

export function useUsageQuery(enabled = true) {
  return useQuery({
    queryKey: accountKeys.usage(),
    queryFn: getUsage,
    enabled,
  })
}
