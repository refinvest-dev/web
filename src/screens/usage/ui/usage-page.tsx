'use client'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatNumber } from '@/shared/lib/format'
import { useUsageQuery } from '@/entities/account/api/queries'
import type { Usage } from '@/entities/account/model/types'
import { PageHeader } from '@/widgets/app-shell/ui/page-header'

export function UsagePage() {
  const usageQuery = useUsageQuery()

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Usage"
        description="Your current plan and backtest limits for this UTC calendar month"
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {usageQuery.isPending ? (
          <UsageSkeleton />
        ) : usageQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t load usage</AlertTitle>
            <AlertDescription>
              <p>Please try again to view your current plan limits.</p>
              <Button
                className="mt-1"
                onClick={() => usageQuery.refetch()}
                size="sm"
                type="button"
                variant="outline"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : usageQuery.data ? (
          <UsageContent usage={usageQuery.data} />
        ) : null}
      </main>
    </div>
  )
}

function UsageContent({ usage }: { usage: Usage }) {
  const remaining = Math.max(usage.backtestMonthlyLimit - usage.backtestsUsedThisMonth, 0)
  const percent = usage.backtestMonthlyLimit === 0
    ? 0
    : Math.min((usage.backtestsUsedThisMonth / usage.backtestMonthlyLimit) * 100, 100)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current plan <Badge variant="secondary">{usage.tier}</Badge>
          </CardTitle>
          <CardDescription>Backtest capacity resets at the start of each UTC month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-2xl font-semibold tabular-nums">
              {formatNumber(usage.backtestsUsedThisMonth)} / {formatNumber(usage.backtestMonthlyLimit)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatNumber(remaining)} remaining
            </span>
          </div>
          <div
            aria-label={`${usage.backtestsUsedThisMonth} of ${usage.backtestMonthlyLimit} monthly backtests used`}
            aria-valuemax={usage.backtestMonthlyLimit}
            aria-valuemin={0}
            aria-valuenow={usage.backtestsUsedThisMonth}
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backtest policy</CardTitle>
          <CardDescription>Limits enforced when a backtest is submitted.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Maximum period</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatNumber(usage.maxBacktestPeriodDays)} days
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Allowed Assets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {usage.allowedAssets.length > 0 ? usage.allowedAssets.map((asset) => (
                <Badge key={asset} variant="outline">{asset}</Badge>
              )) : <span className="text-sm text-muted-foreground">No Assets are currently available.</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsageSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[0, 1].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
