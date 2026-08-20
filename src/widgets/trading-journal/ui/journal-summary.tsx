import { Activity, Percent, Target, TrendingUp } from 'lucide-react'
import { StatCard } from '@/shared/ui/stat-card'
import { formatCurrency, formatNumber, formatPercent } from '@/shared/lib/format'
import { journalEntries } from '../data'

export function JournalSummary() {
  const closed = journalEntries.length
  const wins = journalEntries.filter((e) => e.outcome === 'win').length
  const winRate = (wins / closed) * 100
  const netPnl = journalEntries.reduce((sum, e) => sum + e.pnl, 0)

  const grossWin = journalEntries
    .filter((e) => e.pnl > 0)
    .reduce((sum, e) => sum + e.pnl, 0)
  const grossLoss = Math.abs(
    journalEntries.filter((e) => e.pnl < 0).reduce((sum, e) => sum + e.pnl, 0),
  )
  const profitFactor = grossLoss === 0 ? grossWin : grossWin / grossLoss
  const avgR =
    journalEntries.reduce((sum, e) => sum + e.rMultiple, 0) / closed

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Net P/L"
        value={formatCurrency(netPnl, { signed: true, compact: true })}
        icon={TrendingUp}
        caption={`${formatNumber(closed)} closed trades`}
      />
      <StatCard
        label="Win rate"
        value={formatPercent(winRate, { digits: 1 })}
        icon={Target}
        caption={`${wins} of ${closed} winners`}
      />
      <StatCard
        label="Profit factor"
        value={profitFactor.toFixed(2)}
        icon={Percent}
        caption="Gross win / gross loss"
      />
      <StatCard
        label="Avg R-multiple"
        value={`${avgR > 0 ? '+' : ''}${avgR.toFixed(2)}R`}
        icon={Activity}
        caption="Per closed trade"
      />
    </div>
  )
}
