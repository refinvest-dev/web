import { NextResponse } from 'next/server'
import type { SeriesMetric } from '@/entities/asset/model/types'

const validMetrics = new Set<SeriesMetric>(['PRICE', 'RETURN', 'NORMALIZED'])

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = (searchParams.get('symbols') ?? '').split(',').filter(Boolean)
  const metric = searchParams.get('metric') as SeriesMetric
  const start = searchParams.get('start') ?? ''
  const end = searchParams.get('end') ?? ''
  if (!symbols.length || !validMetrics.has(metric) || !start || !end || start > end) {
    return NextResponse.json({ message: 'Invalid series request.' }, { status: 400 })
  }
  const dates = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(date.getUTCDate() + index * 7)
    return date.toISOString().slice(0, 10)
  }).filter((date) => date <= end)
  return NextResponse.json({
    datasetSnapshotId: 'local-asset-fixture', snapshotCreatedAt: '2026-09-04T00:00:00Z', adjustmentPolicy: 'LOCAL_FIXTURE',
    series: symbols.map((symbol, symbolIndex) => ({ symbol, points: dates.map((date, index) => ({
      date, value: metric === 'RETURN' ? ((index % 5) - 2) / 100 : metric === 'NORMALIZED' ? 100 + index * (symbolIndex + 1) * 1.7 : 100 + symbolIndex * 50 + index * 3,
    })) })),
  })
}
