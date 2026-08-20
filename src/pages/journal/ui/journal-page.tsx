import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/widgets/app-shell/ui/page-header'
import { JournalSummary } from '@/widgets/trading-journal/ui/journal-summary'
import { JournalLog } from '@/widgets/trading-journal/ui/journal-log'

export const metadata: Metadata = {
  title: 'Trading Journal',
  description: 'Review closed trades, outcomes, and execution notes.',
}

export function JournalPage() {
  return (
    <>
      <PageHeader
        title="Trading Journal"
        description="Every closed trade with outcome, R-multiple, and execution notes."
        actions={
          <Button size="sm" disabled>
            <Plus data-icon="inline-start" />
            Log trade unavailable
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <JournalSummary />
        <JournalLog />
      </div>
    </>
  )
}
