import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { BacktestExplorer } from '@/features/backtest/components/backtest-explorer'

export default function BacktestsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Backtests"
        description="Review historical strategy simulations"
        actions={
          <Button size="sm">
            <Play data-icon="inline-start" />
            Run Backtest
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <BacktestExplorer />
      </main>
    </div>
  )
}
