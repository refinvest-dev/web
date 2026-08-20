import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { JournalSummary } from '@/features/trading-journal/components/journal-summary'
import { JournalLog } from '@/features/trading-journal/components/journal-log'

export const metadata: Metadata = {
  title: 'Trading Journal',
  description: 'Review closed trades, outcomes, and execution notes.',
}

export default function JournalPage() {
  return (
    <>
      <PageHeader
        title="Trading Journal"
        description="Every closed trade with outcome, R-multiple, and execution notes."
        actions={
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Log trade
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
