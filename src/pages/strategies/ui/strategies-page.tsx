import { PageHeader } from '@/widgets/app-shell/ui/page-header'
import { CreateStrategyDialog } from '@/features/create-strategy/ui/create-strategy-dialog'
import { StrategyList } from '@/widgets/strategy-list/ui/strategy-list'

export function StrategiesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Strategies"
        description="Create and manage your trading strategies"
        actions={<CreateStrategyDialog />}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <StrategyList />
      </main>
    </div>
  )
}
