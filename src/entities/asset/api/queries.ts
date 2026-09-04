'use client'

import { useQuery } from '@tanstack/react-query'
import { getAssetAvailability, getSeries, listAssets } from './asset-api'
import type { SeriesMetric } from '../model/types'
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

export function useAssetSeriesQuery(params: { symbols: string[]; metric: SeriesMetric; start: string; end: string }) {
  return useQuery({
    queryKey: assetKeys.series(params), queryFn: () => getSeries(params),
    enabled: params.symbols.length > 0 && Boolean(params.start && params.end && params.start <= params.end),
  })
}
