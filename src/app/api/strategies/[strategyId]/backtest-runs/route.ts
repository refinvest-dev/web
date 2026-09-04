import { NextResponse } from 'next/server'
import { listBacktestRuns } from '@/entities/backtest/api/server/backtest-run-store'
import { getStrategy } from '@/entities/strategy/api/server/strategy-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ strategyId: string }> },
) {
  const { strategyId } = await params
  if (!getStrategy(strategyId)) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Strategy not found.' },
      { status: 404 },
    )
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0)
  const rawSize = Number(searchParams.get('size') ?? '20') || 20
  const size = Math.min(100, Math.max(1, rawSize))
  return NextResponse.json(listBacktestRuns(strategyId, page, size))
}
