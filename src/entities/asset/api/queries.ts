'use client'

import { useQuery } from '@tanstack/react-query'
import { getAssetAvailability, listAssets } from './asset-api'
import { assetKeys } from './query-keys'

export function useAssetsQuery() {
  return useQuery({
    queryKey: assetKeys.list(),
    queryFn: listAssets,
  })
}

export function useAssetAvailabilityQuery(symbol: string, enabled = true) {
  return useQuery({
    queryKey: assetKeys.availability(symbol),
    queryFn: () => getAssetAvailability(symbol),
    enabled: Boolean(symbol) && enabled,
  })
}
