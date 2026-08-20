import { PageHeader } from '@/components/layout/page-header'
import { CreateStrategyDialog } from '@/features/strategy-create/ui/create-strategy-dialog'
import { StrategyList } from '@/widgets/strategy-list/ui/strategy-list'

export default function StrategiesPage() {
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
