'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, GitBranch } from 'lucide-react'
import { Card } from '@/shared/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { formatDate } from '@/shared/lib/format'
import {
  isLatestVersion,
  orderVersionsByRecency,
  type StrategyVersion,
} from '@/entities/strategy-version/model/types'
import { StrategyVersionLatestBadge } from '@/entities/strategy-version/ui/strategy-version-latest-badge'
import { CreateStrategyVersionDialog } from '@/features/create-strategy-version/ui/create-strategy-version-dialog'

/**
 * The Versions analytical section of the Strategy detail experience.
 * Composes already-loaded data from `StrategyDetail` (no own query, so no
 * duplicated server state) and links each row to its version detail.
 */
export function StrategyVersionList({
  strategyId,
  versions,
  latestVersionId,
}: {
  strategyId: string
  versions: StrategyVersion[]
  latestVersionId: string | null
}) {
  const ordered = orderVersionsByRecency(versions)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Versions
          <span className="ml-2 font-normal text-muted-foreground">
            {versions.length}
          </span>
        </h2>
        <CreateStrategyVersionDialog strategyId={strategyId} />
      </div>

      {ordered.length > 0 ? (
        <VersionTable
          strategyId={strategyId}
          versions={ordered}
          latestVersionId={latestVersionId}
        />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GitBranch />
            </EmptyMedia>
            <EmptyTitle>No versions yet</EmptyTitle>
            <EmptyDescription>
              Define the first version to capture this strategy&apos;s signal and
              execution rules.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateStrategyVersionDialog strategyId={strategyId} />
          </EmptyContent>
        </Empty>
      )}
    </section>
  )
}

function VersionTable({
  strategyId,
  versions,
  latestVersionId,
}: {
  strategyId: string
  versions: StrategyVersion[]
  latestVersionId: string | null
}) {
  const router = useRouter()

  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-6">Version</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Primary signal</TableHead>
              <TableHead>Execution</TableHead>
              <TableHead className="text-right">Lag</TableHead>
              <TableHead className="text-right">Hold (sessions)</TableHead>
              <TableHead className="text-right">Conditions</TableHead>
              <TableHead className="w-10 pr-6" aria-label="Open" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((v) => {
              const href = `/strategies/${strategyId}/versions/${v.id}`
              const latest = isLatestVersion(v, latestVersionId)
              return (
                <TableRow
                  key={v.id}
                  className="cursor-pointer border-border"
                  onClick={() => router.push(href)}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <Link
                        href={href}
                        className="w-fit font-mono text-xs text-foreground outline-none hover:underline focus-visible:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {v.id}
                      </Link>
                      {latest && <StrategyVersionLatestBadge />}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(v.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {v.primarySignalAsset}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {v.executionAsset}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {v.lag}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {v.exit.holdingSignalSessions}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {v.conditions.length}
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
    </Card>
  )
}
