'use client'

import Link from 'next/link'
import { CircleAlert, GitBranch, RotateCw, SearchX } from 'lucide-react'
import { ApiError } from '@/shared/api/http'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatDate } from '@/shared/lib/format'
import { useStrategyVersionQuery } from '@/entities/strategy-version/api/queries'
import { StrategyVersionLatestBadge } from '@/entities/strategy-version/ui/strategy-version-latest-badge'
import { StrategyVersionDefinition } from '@/entities/strategy-version/ui/strategy-version-definition'

export function StrategyVersionDetail({
  strategyId,
  versionId,
}: {
  strategyId: string
  versionId: string
}) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useStrategyVersionQuery(strategyId, versionId)
  const strategyHref = `/strategies/${strategyId}`

  if (isPending) return <StrategyVersionDetailSkeleton />

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <StrategyUnavailable />
    }
    const message =
      error instanceof ApiError
        ? error.message
        : 'Something went wrong while loading this strategy version.'
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Failed to load strategy version</AlertTitle>
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

  if (!data.version) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Version not found</EmptyTitle>
          <EmptyDescription>
            This version doesn&apos;t belong to the selected strategy.
          </EmptyDescription>
        </EmptyHeader>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={strategyHref} />}
        >
          Back to strategy
        </Button>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {data.strategyName}
              </span>
              <CardTitle className="font-mono text-lg">{data.version.id}</CardTitle>
            </div>
            {data.isLatest && <StrategyVersionLatestBadge />}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Detail label="Created">{formatDate(data.version.createdAt)}</Detail>
            <Detail label="Conditions">{data.version.conditions.length}</Detail>
            <Detail label="Strategy ID">
              <span className="font-mono text-xs">{data.strategyId}</span>
            </Detail>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <StrategyVersionDefinition version={data.version} />
        </CardContent>
      </Card>
    </div>
  )
}

function StrategyUnavailable() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GitBranch />
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

function StrategyVersionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
