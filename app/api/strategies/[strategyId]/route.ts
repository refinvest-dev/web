/**
 * Core public API contract stub — `/strategies/{strategyId}`.
 * Implements `getStrategy` (GET) returning StrategyDetail.
 */
import { NextResponse } from 'next/server'
import { getStrategy } from '@/lib/server/strategy-store'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ strategyId: string }> },
) {
  const { strategyId } = await params

  await delay(350)
  const detail = getStrategy(strategyId)
  if (!detail) {
    return NextResponse.json(
      { message: 'Strategy not found.' },
      { status: 404 },
    )
  }
  return NextResponse.json(detail)
}
