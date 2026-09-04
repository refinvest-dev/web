'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CircleAlert, GitBranch, Loader2, RotateCw, SearchX } from 'lucide-react'
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
import type { BacktestRunStatus } from '@/entities/backtest/model/types'
import { useStrategyVersionQuery } from '@/entities/strategy-version/api/queries'
import type { StrategyVersion } from '@/entities/strategy/model/types'
import { StrategyVersionLatestBadge } from '@/entities/strategy-version/ui/strategy-version-latest-badge'
import { StrategyVersionDefinition } from '@/entities/strategy-version/ui/strategy-version-definition'
import { useBacktestRunQuery } from '@/entities/backtest/api/queries'
import { RunBacktestDialog } from '@/features/run-backtest/ui/run-backtest-dialog'

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
    <StrategyVersionDetailContent
      strategyId={data.strategyId}
      strategyName={data.strategyName}
      version={data.version}
      isLatest={data.isLatest}
    />
  )
}

function StrategyVersionDetailContent({
  strategyId,
  strategyName,
  version,
  isLatest,
}: {
  strategyId: string
  strategyName: string
  version: StrategyVersion | null
  isLatest: boolean
}) {
  const [runId, setRunId] = useState<string | null>(null)
  const runQuery = useBacktestRunQuery(runId)

  if (!version) return null

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {strategyName}
              </span>
              <CardTitle className="font-mono text-lg">{version.id}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isLatest && <StrategyVersionLatestBadge />}
              <RunBacktestDialog strategyVersionId={version.id} onAccepted={setRunId} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Detail label="Created">{formatDate(version.createdAt)}</Detail>
            <Detail label="Conditions">{version.conditions.length}</Detail>
            <Detail label="Strategy ID">
              <span className="font-mono text-xs">{strategyId}</span>
            </Detail>
          </dl>
        </CardContent>
      </Card>

      {runId && (
        <BacktestRunStatus
          runId={runId}
          status={runQuery.data?.status}
          isError={runQuery.isError}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <StrategyVersionDefinition version={version} />
        </CardContent>
      </Card>
    </div>
  )
}

function BacktestRunStatus({
  runId,
  status,
  isError,
}: {
  runId: string
  status: BacktestRunStatus | undefined
  isError: boolean
}) {
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&apos;t check backtest status</AlertTitle>
        <AlertDescription>
          The run was accepted, but its current status could not be loaded.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant={status === 'FAILED' ? 'destructive' : 'default'}>
      {status === 'PENDING' || status === 'RUNNING' ? (
        <Loader2 className="animate-spin" />
      ) : null}
      <AlertTitle>
        {status === 'COMPLETED'
          ? 'Backtest completed'
          : status === 'FAILED'
            ? 'Backtest failed'
            : 'Backtest queued'}
      </AlertTitle>
      <AlertDescription>
        <span className="font-mono text-xs">{runId}</span>
        {status === 'PENDING' || status === 'RUNNING'
          ? ' — this page checks for updates every few seconds.'
          : null}
      </AlertDescription>
    </Alert>
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
