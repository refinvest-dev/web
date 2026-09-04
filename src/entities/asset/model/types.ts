/** API-boundary types for the Core public Asset endpoints. */
export type AssetCalendar = 'US_EQUITY' | 'CRYPTO_UTC'

export interface Asset {
  symbol: string
  calendar: AssetCalendar
  inceptionDate: string
  executionEnabled: boolean
  dataAvailability?: {
    firstDate: string
    lastDate: string
  } | null
}

export interface AssetListResponse {
  assets: Asset[]
}

export interface AssetAvailability {
  symbol: string
  inceptionDate: string
  dataAvailability: {
    firstDate: string
    lastDate: string
  }
  datasetSnapshotId: string
  snapshotCreatedAt: string
}

export type SeriesMetric = 'PRICE' | 'RETURN' | 'NORMALIZED'

export interface AssetSeries {
  symbol: string
  points: Array<{ date: string; value: number }>
}

export interface SeriesResponse {
  datasetSnapshotId: string
  snapshotCreatedAt: string
  adjustmentPolicy: string
  series: AssetSeries[]
}
