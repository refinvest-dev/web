import type { BacktestTrade, EquityCurvePoint } from './types'

export interface ComparisonCurvePoint {
  date: string
  strategy?: number
  benchmark?: number
}

export interface TradeTimelineEvent {
  time: string
  kind: 'SIGNAL' | 'ENTRY' | 'EXIT'
  tradeIndex: number
}

/**
 * Combines independently observed portfolio indexes for chart rendering only.
 * Missing observations stay undefined: values are never carried forward or
 * interpolated across different market calendars (ADR-052).
 */
export function mergePortfolioCurves(
  strategyCurve: EquityCurvePoint[],
  benchmarkCurve: EquityCurvePoint[],
): ComparisonCurvePoint[] {
  const points = new Map<string, ComparisonCurvePoint>()

  for (const point of strategyCurve) {
    const existing = points.get(point.date) ?? { date: point.date }
    existing.strategy = point.value
    points.set(point.date, existing)
  }

  for (const point of benchmarkCurve) {
    const existing = points.get(point.date) ?? { date: point.date }
    existing.benchmark = point.value
    points.set(point.date, existing)
  }

  return [...points.values()].sort((left, right) => left.date.localeCompare(right.date))
}

export function deriveDrawdownCurve(curve: EquityCurvePoint[]): EquityCurvePoint[] {
  let runningPeak = Number.NEGATIVE_INFINITY

  return curve.map((point) => {
    runningPeak = Math.max(runningPeak, point.value)
    return {
      date: point.date,
      value: point.value / runningPeak - 1,
    }
  })
}

export function createTradeTimeline(trades: BacktestTrade[]): TradeTimelineEvent[] {
  return trades
    .flatMap((trade, tradeIndex) => [
      { time: trade.signalTime, kind: 'SIGNAL' as const, tradeIndex },
      { time: trade.entryTime, kind: 'ENTRY' as const, tradeIndex },
      { time: trade.exitTime, kind: 'EXIT' as const, tradeIndex },
    ])
    .sort((left, right) => {
      const byTime = left.time.localeCompare(right.time)
      if (byTime !== 0) return byTime
      return eventOrder(left.kind) - eventOrder(right.kind)
    })
}

function eventOrder(kind: TradeTimelineEvent['kind']) {
  return { SIGNAL: 0, ENTRY: 1, EXIT: 2 }[kind]
}
