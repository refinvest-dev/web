'use client'

import { useQuery } from '@tanstack/react-query'
import { listAssets } from './asset-api'
import { assetKeys } from './query-keys'

export function useAssetsQuery() {
  return useQuery({
    queryKey: assetKeys.list(),
    queryFn: listAssets,
  })
}
