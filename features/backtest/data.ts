/**
 * Representative mock data for the Backtests page prototype.
 * UI-validation data only — no backend contract implied.
 */

export interface BacktestCurvePoint {
  date: string
  strategy: number
  benchmark: number
}

export interface Backtest {
  id: string
  name: string
  strategy: string
  period: string
  cagr: number
  sharpe: number
  sortino: number
  maxDrawdown: number
  volatility: number
  totalReturn: number
  trades: number
  runAt: string
  curve: BacktestCurvePoint[]
}

function makeCurve(
  strategyReturns: number[],
  benchmarkReturns: number[],
): BacktestCurvePoint[] {
  let s = 100
  let b = 100
  return strategyReturns.map((sr, i) => {
    s *= 1 + sr / 100
    b *= 1 + benchmarkReturns[i] / 100
    const month = (i % 12) + 1
    const year = 2023 + Math.floor(i / 12)
    return {
      date: `${year}-${String(month).padStart(2, '0')}`,
      strategy: Math.round(s * 100) / 100,
      benchmark: Math.round(b * 100) / 100,
    }
  })
}

export const backtests: Backtest[] = [
  {
    id: 'b-1',
    name: 'Momentum v3 · SPX universe',
    strategy: 'Momentum Breakout',
    period: 'Jan 2023 – Dec 2024',
    cagr: 24.6,
    sharpe: 1.81,
    sortino: 2.44,
    maxDrawdown: -12.4,
    volatility: 14.2,
    totalReturn: 55.3,
    trades: 428,
    runAt: '2024-12-15T09:00:00Z',
    curve: makeCurve(
      [3.1, 2.4, -1.8, 4.2, 1.1, -2.6, 3.8, 2.0, -0.9, 3.4, 1.6, 2.2, 2.8, 1.4, -1.2, 3.9, 0.8, -1.7, 2.6, 3.1, -0.5, 2.4, 1.9, 2.7],
      [1.8, 1.2, -2.4, 2.1, 0.6, -1.9, 1.4, 1.1, -1.6, 1.9, 0.7, 1.3, 1.5, 0.9, -2.0, 2.2, 0.4, -1.1, 1.3, 1.7, -0.8, 1.2, 0.9, 1.4],
    ),
  },
  {
    id: 'b-2',
    name: 'Mean Reversion · liquid tech',
    strategy: 'Mean Reversion',
    period: 'Jan 2023 – Dec 2024',
    cagr: 15.2,
    sharpe: 1.34,
    sortino: 1.71,
    maxDrawdown: -9.1,
    volatility: 10.8,
    totalReturn: 32.6,
    trades: 684,
    runAt: '2024-12-12T11:20:00Z',
    curve: makeCurve(
      [1.9, 1.1, -0.9, 2.0, 0.8, -1.2, 1.6, 1.3, -0.6, 1.8, 0.9, 1.2, 1.4, 1.0, -0.8, 1.9, 0.5, -1.0, 1.3, 1.5, -0.4, 1.2, 0.8, 1.3],
      [1.8, 1.2, -2.4, 2.1, 0.6, -1.9, 1.4, 1.1, -1.6, 1.9, 0.7, 1.3, 1.5, 0.9, -2.0, 2.2, 0.4, -1.1, 1.3, 1.7, -0.8, 1.2, 0.9, 1.4],
    ),
  },
  {
    id: 'b-3',
    name: 'Trend Following · futures',
    strategy: 'Trend Following',
    period: 'Jan 2023 – Dec 2024',
    cagr: 18.9,
    sharpe: 1.05,
    sortino: 1.38,
    maxDrawdown: -21.7,
    volatility: 19.6,
    totalReturn: 41.2,
    trades: 236,
    runAt: '2024-12-09T08:45:00Z',
    curve: makeCurve(
      [4.2, -2.1, 3.6, -3.2, 5.1, -1.4, 2.8, 4.0, -4.1, 3.9, -1.8, 2.4, 3.7, -2.6, 4.2, -3.8, 4.6, -1.2, 3.1, 3.4, -3.5, 2.9, -1.6, 3.2],
      [1.8, 1.2, -2.4, 2.1, 0.6, -1.9, 1.4, 1.1, -1.6, 1.9, 0.7, 1.3, 1.5, 0.9, -2.0, 2.2, 0.4, -1.1, 1.3, 1.7, -0.8, 1.2, 0.9, 1.4],
    ),
  },
  {
    id: 'b-4',
    name: 'Overnight Gap · small caps',
    strategy: 'Overnight Gap',
    period: 'Jan 2023 – Dec 2024',
    cagr: 9.4,
    sharpe: 0.98,
    sortino: 1.22,
    maxDrawdown: -8.3,
    volatility: 9.1,
    totalReturn: 19.7,
    trades: 512,
    runAt: '2024-12-05T13:10:00Z',
    curve: makeCurve(
      [1.2, 0.8, -0.6, 1.4, 0.5, -0.9, 1.0, 0.9, -0.4, 1.1, 0.6, 0.8, 0.9, 0.7, -0.5, 1.2, 0.3, -0.7, 0.8, 1.0, -0.3, 0.7, 0.5, 0.9],
      [1.8, 1.2, -2.4, 2.1, 0.6, -1.9, 1.4, 1.1, -1.6, 1.9, 0.7, 1.3, 1.5, 0.9, -2.0, 2.2, 0.4, -1.1, 1.3, 1.7, -0.8, 1.2, 0.9, 1.4],
    ),
  },
]
