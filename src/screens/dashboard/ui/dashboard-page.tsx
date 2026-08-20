import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/widgets/app-shell/ui/page-header'
import { DashboardOverview } from '@/widgets/dashboard-overview/ui/dashboard-overview'
import { Download, Plus } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Dashboard"
        description="Portfolio overview and recent activity"
        actions={
          <>
            <Button variant="outline" size="sm" disabled>
              <Download data-icon="inline-start" />
              Export unavailable
            </Button>
            <Button size="sm" disabled>
              <Plus data-icon="inline-start" />
              New trade unavailable
            </Button>
          </>
        }
      />

      <DashboardOverview />
    </div>
  )
}
