import { Play } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/widgets/app-shell/ui/page-header'
import { BacktestExplorer } from '@/widgets/backtest-explorer/ui/backtest-explorer'

export function BacktestsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Backtests"
        description="Review historical strategy simulations"
        actions={
          <Button size="sm" disabled>
            <Play data-icon="inline-start" />
            Run backtest unavailable
          </Button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <BacktestExplorer />
      </main>
    </div>
  )
}
