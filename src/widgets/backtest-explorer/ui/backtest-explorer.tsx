'use client'

import { useState } from 'react'
import { CircleAlert, History, RotateCw } from 'lucide-react'
import type { BacktestRunSummary } from '@/entities/backtest/model/types'
import { useBacktestRunQuery, useBacktestRunsQuery } from '@/entities/backtest/api/queries'
import { BacktestResultOverview } from '@/entities/backtest/ui/backtest-result-overview'
import { useStrategiesQuery } from '@/entities/strategy/api/queries'
import { ApiError } from '@/shared/api/http'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { formatDate } from '@/shared/lib/format'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const runListParams = { page: 0, size: 100 }

export function BacktestExplorer() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const strategiesQuery = useStrategiesQuery({ page: 0, size: 100 })
  const strategies = strategiesQuery.data?.items ?? []
  const activeStrategyId = selectedStrategyId ?? strategies[0]?.id ?? ''
  const runsQuery = useBacktestRunsQuery(activeStrategyId, runListParams)
  const runs = runsQuery.data?.items ?? []
  const selectedRun =
    runs.find((run) => run.id === selectedRunId) ?? runs[0] ?? null

  function selectStrategy(strategyId: string | null) {
    setSelectedStrategyId(strategyId)
    setSelectedRunId(null)
  }

  if (strategiesQuery.isPending) return <BacktestExplorerSkeleton />

  if (strategiesQuery.isError) {
    return <QueryError
      title="Failed to load strategies"
      error={strategiesQuery.error}
      onRetry={() => strategiesQuery.refetch()}
      isRetrying={strategiesQuery.isFetching}
    />
  }

  if (strategies.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>No strategies yet</EmptyTitle>
          <EmptyDescription>
            Create and define a strategy before running a backtest.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Strategy</span>
        <Select value={activeStrategyId} onValueChange={selectStrategy}>
          <SelectTrigger aria-label="Select strategy" className="min-w-56">
            <SelectValue placeholder="Select a strategy" />
          </SelectTrigger>
          <SelectContent>
            {strategies.map((strategy) => (
              <SelectItem key={strategy.id} value={strategy.id}>
                {strategy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {runsQuery.isPending ? (
        <BacktestExplorerSkeleton />
      ) : runsQuery.isError ? (
        <QueryError
          title="Failed to load backtest runs"
          error={runsQuery.error}
          onRetry={() => runsQuery.refetch()}
          isRetrying={runsQuery.isFetching}
        />
      ) : runs.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>No backtest runs</EmptyTitle>
            <EmptyDescription>
              Run a backtest from a strategy version to review it here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <BacktestRunList
            runs={runs}
            selectedRunId={selectedRun?.id ?? null}
            onSelect={setSelectedRunId}
          />
          <BacktestRunDetail runId={selectedRun?.id ?? null} />
        </div>
      )}
    </div>
  )
}

function BacktestRunList({
  runs,
  selectedRunId,
  onSelect,
}: {
  runs: BacktestRunSummary[]
  selectedRunId: string | null
  onSelect: (runId: string) => void
}) {
  return (
    <Card className="overflow-hidden py-0">
      <ul className="divide-y divide-border">
        {runs.map((run) => {
          const active = run.id === selectedRunId
          return (
            <li key={run.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(run.id)}
                className={cn(
                  'flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors',
                  'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                  active && 'bg-accent',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {run.id}
                  </span>
                  <BacktestRunStatusBadge status={run.status} />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(run.createdAt)}</span>
                  <span className="whitespace-nowrap">
                    {formatDate(run.requestedPeriod.start)} – {formatDate(run.requestedPeriod.end)}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function BacktestRunDetail({ runId }: { runId: string | null }) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useBacktestRunQuery(runId)

  if (isPending) return <BacktestDetailSkeleton />

  if (isError) {
    return <QueryError
      title="Failed to load backtest result"
      error={error}
      onRetry={() => refetch()}
      isRetrying={isFetching}
    />
  }

  if (!data) return null

  if (data.status === 'COMPLETED' && data.result) {
    return <BacktestResultOverview result={data.result} />
  }

  if (data.status === 'FAILED') {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Backtest failed</AlertTitle>
        <AlertDescription>
          {data.failureReason ?? 'The backtest could not be completed.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Backtest in progress</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This run is {data.status.toLowerCase()}. It refreshes automatically
          while processing.
        </p>
      </CardContent>
    </Card>
  )
}

function BacktestRunStatusBadge({
  status,
}: Pick<BacktestRunSummary, 'status'>) {
  const variant = status === 'FAILED' ? 'destructive' : 'outline'
  const className =
    status === 'COMPLETED'
      ? 'border-financial-positive/30 text-financial-positive'
      : status === 'PENDING'
        ? 'border-warning/40 text-warning'
        : status === 'RUNNING'
          ? 'border-info/30 text-info'
          : undefined
  return <Badge variant={variant} className={className}>{status.toLowerCase()}</Badge>
}

function QueryError({
  title,
  error,
  onRetry,
  isRetrying,
}: {
  title: string
  error: Error
  onRetry: () => void
  isRetrying: boolean
}) {
  const message =
    error instanceof ApiError ? error.message : 'Please try again.'
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-1 w-fit"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RotateCw data-icon="inline-start" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function BacktestExplorerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="gap-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </Card>
      <BacktestDetailSkeleton />
    </div>
  )
}

function BacktestDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
