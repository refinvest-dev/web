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
