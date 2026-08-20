/**
 * Representative mock data for the Trading Journal page prototype.
 * UI-validation data only — no backend contract implied.
 */

export type TradeOutcome = 'win' | 'loss' | 'breakeven'
export type TradeSide = 'long' | 'short'

export interface JournalEntry {
  id: string
  symbol: string
  side: TradeSide
  strategy: string
  quantity: number
  entry: number
  exit: number
  pnl: number
  returnPct: number
  rMultiple: number
  outcome: TradeOutcome
  openedAt: string
  closedAt: string
  note: string
  tags: string[]
}

export const journalEntries: JournalEntry[] = [
  {
    id: 'j-1',
    symbol: 'NVDA',
    side: 'long',
    strategy: 'Momentum Breakout',
    quantity: 200,
    entry: 118.4,
    exit: 131.2,
    pnl: 2560.0,
    returnPct: 10.81,
    rMultiple: 3.2,
    outcome: 'win',
    openedAt: '2024-12-16T14:35:00Z',
    closedAt: '2024-12-18T15:42:00Z',
    note: 'Clean breakout above prior day high on 2x volume. Held through the first pullback and trailed the stop under the 20-EMA.',
    tags: ['breakout', 'high-volume', 'A+ setup'],
  },
  {
    id: 'j-2',
    symbol: 'TSLA',
    side: 'short',
    strategy: 'Mean Reversion',
    quantity: 80,
    entry: 248.9,
    exit: 262.4,
    pnl: -1080.0,
    returnPct: -5.42,
    rMultiple: -1.4,
    outcome: 'loss',
    openedAt: '2024-12-17T15:10:00Z',
    closedAt: '2024-12-17T19:05:00Z',
    note: 'Faded the extension too early — momentum kept running. Should have waited for a lower-high confirmation before sizing in.',
    tags: ['early-entry', 'chased'],
  },
  {
    id: 'j-3',
    symbol: 'AAPL',
    side: 'long',
    strategy: 'Momentum Breakout',
    quantity: 150,
    entry: 224.1,
    exit: 229.8,
    pnl: 912.0,
    returnPct: 2.55,
    rMultiple: 1.1,
    outcome: 'win',
    openedAt: '2024-12-17T14:32:00Z',
    closedAt: '2024-12-17T14:30:00Z',
    note: 'Textbook continuation. Took partial at 1R, let the rest run into the close.',
    tags: ['continuation', 'partial'],
  },
  {
    id: 'j-4',
    symbol: 'MSFT',
    side: 'long',
    strategy: 'Trend Following',
    quantity: 60,
    entry: 412.5,
    exit: 408.1,
    pnl: -660.0,
    returnPct: -1.07,
    rMultiple: -0.9,
    outcome: 'loss',
    openedAt: '2024-12-13T15:00:00Z',
    closedAt: '2024-12-16T20:10:00Z',
    note: 'Trend stalled at resistance. Stopped out on the gap down — risk was well-defined, acceptable loss.',
    tags: ['trend', 'stopped-out'],
  },
  {
    id: 'j-5',
    symbol: 'AMD',
    side: 'long',
    strategy: 'Momentum Breakout',
    quantity: 150,
    entry: 138.2,
    exit: 149.9,
    pnl: 1755.0,
    returnPct: 8.47,
    rMultiple: 2.8,
    outcome: 'win',
    openedAt: '2024-12-13T16:05:00Z',
    closedAt: '2024-12-16T16:48:00Z',
    note: 'Sector strength tailwind. Scaled in on the flag breakout, managed against the rising trendline.',
    tags: ['sector-strength', 'flag'],
  },
  {
    id: 'j-6',
    symbol: 'META',
    side: 'short',
    strategy: 'Mean Reversion',
    quantity: 40,
    entry: 604.3,
    exit: 611.0,
    pnl: -536.0,
    returnPct: -1.11,
    rMultiple: -0.6,
    outcome: 'loss',
    openedAt: '2024-12-12T18:00:00Z',
    closedAt: '2024-12-13T18:22:00Z',
    note: 'Range-bound fade that broke out instead. Small size kept the damage contained.',
    tags: ['fade', 'small-size'],
  },
  {
    id: 'j-7',
    symbol: 'GOOGL',
    side: 'long',
    strategy: 'Overnight Gap',
    quantity: 120,
    entry: 189.4,
    exit: 189.6,
    pnl: 24.0,
    returnPct: 0.11,
    rMultiple: 0.1,
    outcome: 'breakeven',
    openedAt: '2024-12-11T20:55:00Z',
    closedAt: '2024-12-12T14:35:00Z',
    note: 'Gap filled at the open. Exited flat — no edge on the follow-through.',
    tags: ['gap', 'flat'],
  },
]
