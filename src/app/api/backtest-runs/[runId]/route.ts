import { NextResponse } from 'next/server'
import { getBacktestRun } from '@/entities/backtest/api/server/backtest-run-store'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params
  const run = getBacktestRun(runId)
  if (!run) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Backtest run not found.' },
      { status: 404 },
    )
  }
  return NextResponse.json(run)
}
