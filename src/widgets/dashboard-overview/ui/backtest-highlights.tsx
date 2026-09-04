'use client'

import { useState } from 'react'
import { CircleAlert, History, RotateCw } from 'lucide-react'
import { useBacktestRunQuery, useBacktestRunsQuery } from '@/entities/backtest/api/queries'
import type { BacktestRunSummary } from '@/entities/backtest/model/types'
import { useStrategiesQuery } from '@/entities/strategy/api/queries'
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
import { DeltaValue } from '@/shared/ui/delta-value'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { formatDate, formatPercent } from '@/shared/lib/format'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const runListParams = { page: 0, size: 3 }

export function BacktestHighlights() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null)
  const strategiesQuery = useStrategiesQuery({ page: 0, size: 100 })
  const strategies = strategiesQuery.data?.items ?? []
  const activeStrategyId = selectedStrategyId ?? strategies[0]?.id ?? ''
  const runsQuery = useBacktestRunsQuery(activeStrategyId, runListParams)

  if (strategiesQuery.isPending) return <BacktestHighlightsSkeleton />

  if (strategiesQuery.isError) {
    return <QueryError onRetry={() => strategiesQuery.refetch()} />
  }

  if (strategies.length === 0) {
    return (
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">Backtest performance</CardTitle>
          <CardDescription>Review completed strategy runs</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><History /></EmptyMedia>
              <EmptyTitle>No strategies yet</EmptyTitle>
              <EmptyDescription>
                Create and define a strategy before running a backtest.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-4">
      <CardHeader className="gap-1">
        <CardTitle className="text-sm">Backtest performance</CardTitle>
        <CardDescription>Runs for the selected strategy</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select value={activeStrategyId} onValueChange={setSelectedStrategyId}>
          <SelectTrigger aria-label="Select strategy" className="w-full">
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

        {runsQuery.isPending ? (
          <BacktestHighlightsSkeleton />
        ) : runsQuery.isError ? (
          <QueryError onRetry={() => runsQuery.refetch()} />
        ) : (runsQuery.data?.items.length ?? 0) === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><History /></EmptyMedia>
              <EmptyTitle>No backtest runs</EmptyTitle>
              <EmptyDescription>
                Run a backtest from a strategy version to see its performance here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          runsQuery.data?.items.map((run) => <BacktestRunHighlight key={run.id} run={run} />)
        )}
      </CardContent>
    </Card>
  )
}

function BacktestRunHighlight({ run }: { run: BacktestRunSummary }) {
  const runQuery = useBacktestRunQuery(
    run.status === 'COMPLETED' ? run.id : null,
  )
  const metrics = runQuery.data?.result?.metrics

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
        <Badge variant={run.status === 'FAILED' ? 'destructive' : 'outline'}>
          {run.status.toLowerCase()}
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground">{formatDate(run.createdAt)}</span>
      {run.status === 'COMPLETED' && runQuery.isPending ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-9" />)}
        </div>
      ) : run.status === 'COMPLETED' && metrics ? (
        <div className="grid grid-cols-3 gap-2">
          <Metric label="CAGR" value={metrics.cagr} percent />
          <Metric label="Sharpe" value={metrics.sharpe} />
          <Metric label="Max DD" value={metrics.mdd} percent />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {run.status === 'FAILED'
            ? 'This backtest could not be completed.'
            : 'Performance metrics will appear when this run completes.'}
        </p>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  percent = false,
}: {
  label: string
  value: number | null | undefined
  percent?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {value == null ? (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">—</span>
      ) : percent ? (
        <DeltaValue value={value} showIcon={false} className="text-sm">
          {formatPercent(value, { signed: true })}
        </DeltaValue>
      ) : (
        <span className="font-mono text-sm tabular-nums text-foreground">{value.toFixed(2)}</span>
      )}
    </div>
  )
}

function QueryError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>Couldn&apos;t load backtest data</AlertTitle>
      <AlertDescription>
        <p>Please try again.</p>
        <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={onRetry}>
          <RotateCw data-icon="inline-start" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

function BacktestHighlightsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
    </div>
  )
}
