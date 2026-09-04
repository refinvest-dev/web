/**
 * Representative mock data for the dashboard prototype.
 * This is UI-validation data only — no backend contract is implied here.
 */

export interface EquityPoint {
  date: string
  equity: number
  drawdown: number
}

export interface RecentTrade {
  id: string
  symbol: string
  side: 'long' | 'short'
  strategy: string
  entry: number
  exit: number
  pnl: number
  returnPct: number
  closedAt: string
}

export interface StrategySummary {
  id: string
  name: string
  status: 'live' | 'paper' | 'paused'
  allocationPct: number
  pnl: number
  winRate: number
  trades: number
}

export const portfolioSummary = {
  equity: 128450.32,
  equityDeltaPct: 4.82,
  netPnl: 28450.32,
  netPnlDeltaPct: 6.14,
  winRate: 58.3,
  winRateDeltaPct: 1.7,
  profitFactor: 1.94,
  profitFactorDeltaPct: -3.2,
  openPositions: 6,
  sharpe: 1.62,
}

export const equityCurve: EquityPoint[] = [
  { date: '2024-01', equity: 100000, drawdown: 0 },
  { date: '2024-02', equity: 104200, drawdown: -1.2 },
  { date: '2024-03', equity: 101800, drawdown: -3.9 },
  { date: '2024-04', equity: 108650, drawdown: -0.8 },
  { date: '2024-05', equity: 113200, drawdown: -1.4 },
  { date: '2024-06', equity: 110400, drawdown: -4.2 },
  { date: '2024-07', equity: 117900, drawdown: -0.6 },
  { date: '2024-08', equity: 121300, drawdown: -2.1 },
  { date: '2024-09', equity: 118750, drawdown: -3.7 },
  { date: '2024-10', equity: 124600, drawdown: -1.1 },
  { date: '2024-11', equity: 126900, drawdown: -1.9 },
  { date: '2024-12', equity: 128450, drawdown: -0.9 },
]

export const recentTrades: RecentTrade[] = [
  {
    id: 't-1',
    symbol: 'NVDA',
    side: 'long',
    strategy: 'Momentum Breakout',
    entry: 118.4,
    exit: 131.2,
    pnl: 2560.0,
    returnPct: 10.81,
    closedAt: '2024-12-18T15:42:00Z',
  },
  {
    id: 't-2',
    symbol: 'TSLA',
    side: 'short',
    strategy: 'Mean Reversion',
    entry: 248.9,
    exit: 262.4,
    pnl: -1080.0,
    returnPct: -5.42,
    closedAt: '2024-12-17T19:05:00Z',
  },
  {
    id: 't-3',
    symbol: 'AAPL',
    side: 'long',
    strategy: 'Momentum Breakout',
    entry: 224.1,
    exit: 229.8,
    pnl: 912.0,
    returnPct: 2.55,
    closedAt: '2024-12-17T14:30:00Z',
  },
  {
    id: 't-4',
    symbol: 'MSFT',
    side: 'long',
    strategy: 'Trend Following',
    entry: 412.5,
    exit: 408.1,
    pnl: -660.0,
    returnPct: -1.07,
    closedAt: '2024-12-16T20:10:00Z',
  },
  {
    id: 't-5',
    symbol: 'AMD',
    side: 'long',
    strategy: 'Momentum Breakout',
    entry: 138.2,
    exit: 149.9,
    pnl: 1755.0,
    returnPct: 8.47,
    closedAt: '2024-12-16T16:48:00Z',
  },
  {
    id: 't-6',
    symbol: 'META',
    side: 'short',
    strategy: 'Mean Reversion',
    entry: 604.3,
    exit: 611.0,
    pnl: -536.0,
    returnPct: -1.11,
    closedAt: '2024-12-13T18:22:00Z',
  },
]

export const strategySummaries: StrategySummary[] = [
  {
    id: 's-1',
    name: 'Momentum Breakout',
    status: 'live',
    allocationPct: 42,
    pnl: 18240.5,
    winRate: 63.2,
    trades: 214,
  },
  {
    id: 's-2',
    name: 'Mean Reversion',
    status: 'live',
    allocationPct: 28,
    pnl: 6180.75,
    winRate: 54.8,
    trades: 342,
  },
  {
    id: 's-3',
    name: 'Trend Following',
    status: 'paper',
    allocationPct: 20,
    pnl: 4890.2,
    winRate: 49.1,
    trades: 118,
  },
  {
    id: 's-4',
    name: 'Pairs Arbitrage',
    status: 'paused',
    allocationPct: 10,
    pnl: -861.13,
    winRate: 46.4,
    trades: 97,
  },
]
