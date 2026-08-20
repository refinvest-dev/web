'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, CircleAlert, Layers, RotateCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyContent,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApiError } from '@/lib/api/http'
import { formatDate } from '@/lib/format'
import { useStrategiesQuery } from '@/entities/strategy/api/queries'
import { strategyConfigState } from '@/entities/strategy/model/types'
import { StrategyStatusBadge } from '@/entities/strategy/ui/strategy-status-badge'
import { CreateStrategyDialog } from '@/features/strategy-create/ui/create-strategy-dialog'

export function StrategyList() {
  const router = useRouter()
  const { data, isPending, isError, error, refetch, isFetching } =
    useStrategiesQuery({ page: 0, size: 50 })

  if (isPending) return <StrategyListSkeleton />

  if (isError) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Something went wrong while loading strategies.'
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Failed to load strategies</AlertTitle>
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

  if (data.items.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Layers />
          </EmptyMedia>
          <EmptyTitle>No strategies yet</EmptyTitle>
          <EmptyDescription>
            Create your first strategy to define signal conditions and run
            backtests.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateStrategyDialog />
        </EmptyContent>
      </Empty>
    )
  }

  const configuredCount = data.items.filter(
    (s) => strategyConfigState(s) === 'configured',
  ).length

  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-6">Strategy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10 pr-6" aria-label="Open" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((s) => {
              const href = `/strategies/${s.id}`
              return (
                <TableRow
                  key={s.id}
                  className="cursor-pointer border-border"
                  onClick={() => router.push(href)}
                >
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <Link
                        href={href}
                        className="w-fit text-sm font-medium text-foreground outline-none hover:underline focus-visible:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {s.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StrategyStatusBadge strategy={s} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(s.createdAt)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
        <span>
          {data.total} {data.total === 1 ? 'strategy' : 'strategies'} ·{' '}
          {configuredCount} configured
        </span>
        {isFetching && <span>Updating…</span>}
      </div>
    </Card>
  )
}

function StrategyListSkeleton() {
  return (
    <Card className="overflow-hidden py-0">
      <div className="flex flex-col divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  )
}
