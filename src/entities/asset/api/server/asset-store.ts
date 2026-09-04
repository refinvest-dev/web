import type { Asset, AssetAvailability } from '../../model/types'

/**
 * Local development fixture for the Core `GET /assets` contract.
 * Real environments use Core through `NEXT_PUBLIC_API_BASE_URL` instead.
 */
const assets: Asset[] = [
  { symbol: 'QQQ', calendar: 'US_EQUITY', inceptionDate: '1999-03-10', executionEnabled: true },
  { symbol: 'SPY', calendar: 'US_EQUITY', inceptionDate: '1993-01-22', executionEnabled: true },
  { symbol: 'TQQQ', calendar: 'US_EQUITY', inceptionDate: '2010-02-09', executionEnabled: true },
  { symbol: 'SOXL', calendar: 'US_EQUITY', inceptionDate: '2010-03-11', executionEnabled: true },
  { symbol: 'BTCUSDT', calendar: 'CRYPTO_UTC', inceptionDate: '2017-08-17', executionEnabled: true },
  { symbol: 'VIX', calendar: 'US_EQUITY', inceptionDate: '1993-01-04', executionEnabled: false },
]

export function listAssets() {
  return { assets }
}

export function getAssetAvailability(symbol: string): AssetAvailability | null {
  const asset = assets.find((item) => item.symbol === symbol)
  if (!asset) return null

  return {
    symbol: asset.symbol,
    inceptionDate: asset.inceptionDate,
    dataAvailability: {
      firstDate: asset.inceptionDate,
      lastDate: '2026-09-04',
    },
    datasetSnapshotId: 'local-asset-fixture',
    snapshotCreatedAt: '2026-09-04T00:00:00Z',
  }
}
