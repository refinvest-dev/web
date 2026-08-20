import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { SummaryStats } from '@/features/dashboard/components/summary-stats'
import { EquityCurveChart } from '@/features/dashboard/components/equity-curve-chart'
import { RecentTrades } from '@/features/dashboard/components/recent-trades'
import { StrategyBreakdown } from '@/features/dashboard/components/strategy-breakdown'
import { BacktestHighlights } from '@/features/dashboard/components/backtest-highlights'
import { Download, Plus } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Dashboard"
        description="Portfolio overview and recent activity"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download data-icon="inline-start" />
              Export
            </Button>
            <Button size="sm">
              <Plus data-icon="inline-start" />
              New Trade
            </Button>
          </>
        }
      />

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
    </div>
  )
}
