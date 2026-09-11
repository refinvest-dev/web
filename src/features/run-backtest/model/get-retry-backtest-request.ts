import type { RunBacktestRequest } from '@/entities/backtest/model/types'

/**
 * Backtest run summaries normally contain every value needed to repeat their
 * request. Validate at the UI boundary so old or malformed persisted runs are
 * never retried with inferred values.
 */
export function getRetryBacktestRequest(run: unknown): {
  strategyVersionId: string
  body: RunBacktestRequest
} | null {
  if (!isRecord(run) || typeof run.strategyVersionId !== 'string' || !run.strategyVersionId) {
    return null
  }

  const period = run.requestedPeriod
  const feeModel = run.feeModel
  if (
    !isRecord(period) ||
    typeof period.start !== 'string' ||
    !period.start ||
    typeof period.end !== 'string' ||
    !period.end ||
    !isRecord(feeModel) ||
    !isNonNegativeFiniteNumber(feeModel.commission) ||
    !isNonNegativeFiniteNumber(feeModel.slippage)
  ) {
    return null
  }

  return {
    strategyVersionId: run.strategyVersionId,
    body: {
      period: { start: period.start, end: period.end },
      feeModel: {
        commission: feeModel.commission,
        slippage: feeModel.slippage,
      },
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
