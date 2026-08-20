'use client'

import { useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { cn } from '@/shared/lib/utils'
import { DeltaValue } from '@/shared/ui/delta-value'
import { formatDate, formatNumber, formatPercent } from '@/shared/lib/format'
import { backtests } from '../data'

const chartConfig = {
  strategy: { label: 'Strategy', color: 'var(--chart-1)' },
  benchmark: { label: 'Benchmark', color: 'var(--chart-5)' },
} satisfies ChartConfig

function monthLabel(value: string) {
  const [year, month] = value.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function BacktestExplorer() {
  const [selectedId, setSelectedId] = useState(backtests[0].id)
  const selected = backtests.find((b) => b.id === selectedId) ?? backtests[0]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Run list */}
      <Card className="overflow-hidden py-0">
        <ul className="divide-y divide-border">
          {backtests.map((bt) => {
            const active = bt.id === selectedId
            return (
              <li key={bt.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(bt.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors',
                    'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                    active && 'bg-accent',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-4 w-0.5 shrink-0 rounded-full',
                        active ? 'bg-primary' : 'bg-transparent',
                      )}
                      aria-hidden
                    />
                    <span className="truncate text-sm font-medium">
                      {bt.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-2.5">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(bt.runAt)}
                    </span>
                    <DeltaValue
                      value={bt.cagr}
                      showIcon={false}
                      className="text-xs"
                    >
                      {formatPercent(bt.cagr, { signed: true })} CAGR
                    </DeltaValue>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Detail */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricTile label="Total Return" tone={selected.totalReturn}>
            {formatPercent(selected.totalReturn, { signed: true })}
          </MetricTile>
          <MetricTile label="CAGR" tone={selected.cagr}>
            {formatPercent(selected.cagr, { signed: true })}
          </MetricTile>
          <MetricTile label="Sharpe">{selected.sharpe.toFixed(2)}</MetricTile>
          <MetricTile label="Sortino">{selected.sortino.toFixed(2)}</MetricTile>
          <MetricTile label="Max DD" tone={selected.maxDrawdown}>
            {formatPercent(selected.maxDrawdown)}
          </MetricTile>
          <MetricTile label="Volatility">
            {formatPercent(selected.volatility)}
          </MetricTile>
        </div>

        <Card className="gap-4">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm">
              Growth of $100 · {selected.period}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {formatNumber(selected.trades)} trades
            </span>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-72 w-full"
            >
              <LineChart
                data={selected.curve}
                margin={{ left: 4, right: 8, top: 4 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={24}
                  tickFormatter={monthLabel}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickMargin={4}
                  tickFormatter={(v: number) => `$${Math.round(v)}`}
                  domain={['dataMin - 6', 'dataMax + 6']}
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        payload?.[0]
                          ? monthLabel(String(payload[0].payload.date))
                          : ''
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="strategy"
                  type="monotone"
                  stroke="var(--color-strategy)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="benchmark"
                  type="monotone"
                  stroke="var(--color-benchmark)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricTile({
  label,
  tone,
  children,
}: {
  label: string
  tone?: number
  children: React.ReactNode
}) {
  return (
    <Card className="gap-0 p-3">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {tone !== undefined ? (
        <DeltaValue
          value={tone}
          showIcon={false}
          className="mt-1 text-base font-semibold"
        >
          {children}
        </DeltaValue>
      ) : (
        <span className="mt-1 font-mono text-base font-semibold tabular-nums text-foreground">
          {children}
        </span>
      )}
    </Card>
  )
}
