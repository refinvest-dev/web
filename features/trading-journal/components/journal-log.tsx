'use client'

import { Fragment, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeltaValue } from '@/components/shared/delta-value'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from '@/lib/format'
import { journalEntries, type TradeOutcome } from '../data'

type Filter = 'all' | TradeOutcome

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'win', label: 'Wins' },
  { value: 'loss', label: 'Losses' },
  { value: 'breakeven', label: 'Breakeven' },
]

export function JournalLog() {
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const entries = useMemo(
    () =>
      filter === 'all'
        ? journalEntries
        : journalEntries.filter((e) => e.outcome === filter),
    [filter],
  )

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {formatNumber(entries.length)} entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-8 pl-6" />
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="hidden md:table-cell">Strategy</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Qty</TableHead>
              <TableHead className="text-right">R</TableHead>
              <TableHead className="text-right">Return</TableHead>
              <TableHead className="pr-6 text-right">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const open = expandedId === entry.id
              return (
                <Fragment key={entry.id}>
                  <TableRow
                    className="cursor-pointer border-border"
                    onClick={() => setExpandedId(open ? null : entry.id)}
                    aria-expanded={open}
                  >
                    <TableCell className="pl-6">
                      <ChevronRight
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          open && 'rotate-90',
                        )}
                        aria-hidden
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium">
                          {entry.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(entry.closedAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-mono text-[11px] uppercase',
                          entry.side === 'long'
                            ? 'border-financial-positive/30 text-financial-positive'
                            : 'border-financial-negative/30 text-financial-negative',
                        )}
                      >
                        {entry.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {entry.strategy}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-sm tabular-nums text-muted-foreground lg:table-cell">
                      {formatNumber(entry.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeltaValue
                        value={entry.rMultiple}
                        showIcon={false}
                        className="justify-end text-sm"
                      >
                        {entry.rMultiple > 0 ? '+' : ''}
                        {entry.rMultiple.toFixed(1)}R
                      </DeltaValue>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeltaValue
                        value={entry.returnPct}
                        showIcon={false}
                        className="justify-end text-sm"
                      >
                        {formatPercent(entry.returnPct, { signed: true })}
                      </DeltaValue>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DeltaValue
                        value={entry.pnl}
                        showIcon={false}
                        className="justify-end text-sm"
                      >
                        {formatCurrency(entry.pnl, { signed: true })}
                      </DeltaValue>
                    </TableCell>
                  </TableRow>
                  {open && (
                    <TableRow className="border-border hover:bg-transparent">
                      <TableCell colSpan={8} className="bg-muted/40 px-6 py-4">
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
                            <DetailField label="Entry">
                              {formatCurrency(entry.entry)}
                            </DetailField>
                            <DetailField label="Exit">
                              {formatCurrency(entry.exit)}
                            </DetailField>
                            <DetailField label="Opened">
                              {formatDateTime(entry.openedAt)}
                            </DetailField>
                            <DetailField label="Closed">
                              {formatDateTime(entry.closedAt)}
                            </DetailField>
                          </div>
                          <p className="max-w-3xl text-sm leading-relaxed text-foreground">
                            {entry.note}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[11px] font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function DetailField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums text-foreground">
        {children}
      </span>
    </div>
  )
}
