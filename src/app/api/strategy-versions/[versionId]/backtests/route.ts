import { NextResponse } from 'next/server'
import { createPendingBacktestRun } from '@/entities/backtest/api/server/backtest-run-store'
import type { BacktestPeriod, FeeModel } from '@/entities/backtest/model/types'
import { findStrategyIdByVersion } from '@/entities/strategy/api/server/strategy-store'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPeriod(value: unknown): value is BacktestPeriod {
  return (
    isRecord(value) &&
    typeof value.start === 'string' &&
    typeof value.end === 'string'
  )
}

function isFeeModel(value: unknown): value is FeeModel {
  return (
    isRecord(value) &&
    typeof value.commission === 'number' &&
    Number.isFinite(value.commission) &&
    value.commission >= 0 &&
    typeof value.slippage === 'number' &&
    Number.isFinite(value.slippage) &&
    value.slippage >= 0
  )
}

function isRequestBody(value: unknown): value is {
  period: BacktestPeriod
  feeModel: FeeModel
} {
  return (
    isRecord(value) && isPeriod(value.period) && isFeeModel(value.feeModel)
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params
  const strategyId = findStrategyIdByVersion(versionId)
  if (!strategyId) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Strategy version not found.' },
      { status: 404 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'BAD_REQUEST', message: 'Invalid JSON body.' },
      { status: 400 },
    )
  }

  if (!isRequestBody(body)) {
    return NextResponse.json(
      {
        code: 'BAD_REQUEST',
        message: 'Both period and feeModel are required.',
      },
      { status: 400 },
    )
  }

  return NextResponse.json(
    createPendingBacktestRun({
      strategyId,
      strategyVersionId: versionId,
      period: body.period,
      feeModel: body.feeModel,
    }),
    { status: 202 },
  )
}
