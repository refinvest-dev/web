import { Wallet, TrendingUp, Target, Scale } from 'lucide-react'
import { StatCard } from '@/shared/ui/stat-card'
import { formatCurrency, formatPercent } from '@/shared/lib/format'
import { portfolioSummary as s } from '../data'

export function SummaryStats() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Total Equity"
        value={formatCurrency(s.equity)}
        icon={Wallet}
        delta={{
          value: s.equityDeltaPct,
          label: formatPercent(s.equityDeltaPct, { signed: true }),
        }}
      />
      <StatCard
        label="Net P/L"
        value={formatCurrency(s.netPnl, { signed: true })}
        icon={TrendingUp}
        delta={{
          value: s.netPnlDeltaPct,
          label: formatPercent(s.netPnlDeltaPct, { signed: true }),
        }}
      />
      <StatCard
        label="Win Rate"
        value={formatPercent(s.winRate)}
        icon={Target}
        delta={{
          value: s.winRateDeltaPct,
          label: formatPercent(s.winRateDeltaPct, { signed: true }),
        }}
      />
      <StatCard
        label="Profit Factor"
        value={s.profitFactor.toFixed(2)}
        icon={Scale}
        delta={{
          value: s.profitFactorDeltaPct,
          label: formatPercent(s.profitFactorDeltaPct, { signed: true }),
        }}
      />
    </div>
  )
}
