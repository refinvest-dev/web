'use client'

import Link from 'next/link'
import { CircleAlert, RotateCw, SearchX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { ApiError } from '@/shared/api/http'
import { formatDate } from '@/shared/lib/format'
import { useStrategyQuery } from '@/entities/strategy/api/queries'
import { StrategyStatusBadge } from '@/entities/strategy/ui/strategy-status-badge'
import { StrategyVersionList } from '@/widgets/strategy-version-list/ui/strategy-version-list'
import type { StrategyDetail as StrategyDetailModel } from '@/entities/strategy/model/types'

export function StrategyDetail({ strategyId }: { strategyId: string }) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useStrategyQuery(strategyId)

  if (isPending) return <StrategyDetailSkeleton />

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>Strategy not found</EmptyTitle>
            <EmptyDescription>
              This strategy doesn&apos;t exist or isn&apos;t available.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/strategies" />}
          >
            Back to strategies
          </Button>
        </Empty>
      )
    }
    const message =
      error instanceof ApiError
        ? error.message
        : 'Something went wrong while loading this strategy.'
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Failed to load strategy</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-fit"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RotateCw data-icon="inline-start" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return <StrategyDetailContent strategy={data} />
}

function StrategyDetailContent({
  strategy,
}: {
  strategy: StrategyDetailModel
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle className="text-lg">{strategy.name}</CardTitle>
              <span className="font-mono text-xs text-muted-foreground">
                {strategy.id}
              </span>
            </div>
            <StrategyStatusBadge strategy={strategy} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Detail label="Created">{formatDate(strategy.createdAt)}</Detail>
            <Detail label="Versions">{strategy.versions.length}</Detail>
            <Detail label="Latest version">
              {strategy.latestVersionId ? (
                <span className="font-mono text-xs">
                  {strategy.latestVersionId}
                </span>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </Detail>
          </dl>
        </CardContent>
      </Card>

      <StrategyVersionList
        strategyId={strategy.id}
        versions={strategy.versions}
        latestVersionId={strategy.latestVersionId}
      />
    </div>
  )
}

function Detail({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm tabular-nums">{children}</dd>
    </div>
  )
}

function StrategyDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-1 h-3 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}
