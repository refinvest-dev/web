import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/widgets/app-shell/ui/page-header'
import { StrategyDetail } from '@/widgets/strategy-detail/ui/strategy-detail'

export async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string }>
}) {
  const { strategyId } = await params

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Strategy detail"
        description="Overview, versions, and backtests"
        actions={
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/strategies" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Strategies
          </Button>
        }
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <StrategyDetail strategyId={strategyId} />
      </main>
    </div>
  )
}
