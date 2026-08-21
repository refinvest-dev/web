import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/widgets/app-shell/ui/page-header'
import { StrategyVersionDetail } from '@/widgets/strategy-version-detail/ui/strategy-version-detail'

export async function StrategyVersionDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string; versionId: string }>
}) {
  const { strategyId, versionId } = await params
  const strategyHref = `/strategies/${strategyId}`

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Strategy version"
        description="Read-only signal and execution definition"
        actions={
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={strategyHref} />}
          >
            <ArrowLeft data-icon="inline-start" />
            Strategy
          </Button>
        }
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <StrategyVersionDetail strategyId={strategyId} versionId={versionId} />
      </main>
    </div>
  )
}
