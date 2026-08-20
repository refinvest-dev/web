import { BacktestHighlights } from './backtest-highlights'
import { EquityCurveChart } from './equity-curve-chart'
import { RecentTrades } from './recent-trades'
import { StrategyBreakdown } from './strategy-breakdown'
import { SummaryStats } from './summary-stats'

export function DashboardOverview() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <SummaryStats />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EquityCurveChart />
        </div>
        <StrategyBreakdown />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTrades />
        </div>
        <BacktestHighlights />
      </div>
    </main>
  )
}
