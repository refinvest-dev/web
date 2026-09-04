'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartNoAxesColumnIncreasing, TriangleAlert } from 'lucide-react'
import type { BacktestResult, BacktestTrade } from '../model/types'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'
import { DeltaValue } from '@/shared/ui/delta-value'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from '@/shared/lib/format'
import {
  Empty,
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

const chartConfig = {
  equity: { label: 'Equity', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function BacktestResultOverview({ result }: { result: BacktestResult }) {
  const { metrics } = result

  if (result.sampleSizeWarning === 'ZERO') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Backtest result</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty className="border-0 p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartNoAxesColumnIncreasing />
              </EmptyMedia>
              <EmptyTitle>No trades in this period</EmptyTitle>
              <EmptyDescription>
                The strategy did not produce an entry signal for the selected
                period, so performance metrics are unavailable.
              </EmptyDescription>
            </EmptyHeader>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {formatNumber(metrics.tradeCount ?? 0)} trades
            </span>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {result.sampleSizeWarning === 'LOW' && (
        <Alert>
          <TriangleAlert />
          <AlertTitle>Limited sample size</AlertTitle>
          <AlertDescription>
            This result contains fewer than 10 trades. Interpret performance
            metrics with caution.
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="backtest-metrics">
        <h2 id="backtest-metrics" className="sr-only">
          Backtest performance metrics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <MetricTile label="Total return" value={metrics.totalReturn} percent />
          <MetricTile label="CAGR" value={metrics.cagr} percent />
          <MetricTile label="Sharpe" value={metrics.sharpe} digits={2} />
          <MetricTile label="Max drawdown" value={metrics.mdd} percent />
          <MetricTile label="Win rate" value={metrics.winRate} percent />
          <MetricTile label="Trades" value={metrics.tradeCount} />
        </div>
      </section>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-sm">Equity curve</CardTitle>
        </CardHeader>
        <CardContent>
          {result.equityCurve.length > 0 ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
              <LineChart data={result.equityCurve} margin={{ left: 4, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={36}
                  tickMargin={10}
                  tickFormatter={formatDate}
                />
                <YAxis
                  dataKey="value"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={60}
                  tickFormatter={(value: number) => formatCurrency(value, { compact: true })}
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => formatDate(String(label))}
                      formatter={(value) =>
                        typeof value === 'number'
                          ? formatCurrency(value)
                          : String(value)
                      }
                    />
                  }
                />
                <Line
                  dataKey="value"
                  name="equity"
                  type="monotone"
                  stroke="var(--color-equity)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No equity-curve points are available for this result.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <BenchmarkCard result={result} />
        <IntegrityCard result={result} />
      </div>

      <TradesCard trades={result.trades} />
    </div>
  )
}

function MetricTile({
  label,
  value,
  percent = false,
  digits = 0,
}: {
  label: string
  value: number | null | undefined
  percent?: boolean
  digits?: number
}) {
  const formatted =
    value == null
      ? '—'
      : percent
        ? formatPercent(value, { signed: true })
        : formatNumber(value, digits)

  return (
    <Card className="gap-0 p-3">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {value != null && (percent || label === 'Max drawdown') ? (
        <DeltaValue value={value} showIcon={false} className="mt-1 text-base font-semibold">
          {formatted}
        </DeltaValue>
      ) : (
        <span className="mt-1 font-mono text-base font-semibold tabular-nums">
          {formatted}
        </span>
      )}
    </Card>
  )
}

function BenchmarkCard({ result }: { result: BacktestResult }) {
  const benchmark = result.benchmark.primary
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Execution asset benchmark</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-4">
          <Detail label="Return" value={formatOptionalPercent(benchmark.totalReturn)} />
          <Detail label="CAGR" value={formatOptionalPercent(benchmark.cagr)} />
          <Detail label="Max DD" value={formatOptionalPercent(benchmark.mdd)} />
        </dl>
      </CardContent>
    </Card>
  )
}

function IntegrityCard({ result }: { result: BacktestResult }) {
  const { dataIntegrityStatus, signalExecutionDelay } = result
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Run integrity</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Detail label="Snapshot" value={dataIntegrityStatus.datasetSnapshotId} mono />
          <Detail
            label="Point-in-time validation"
            value={dataIntegrityStatus.pointInTimeValidationPassed ? 'Passed' : 'Not passed'}
          />
          <Detail
            label="Corporate actions"
            value={dataIntegrityStatus.corporateActionsApplied ? 'Applied' : 'Not applied'}
          />
          <Detail
            label="Median signal delay"
            value={`${formatNumber(signalExecutionDelay.median, 1)} h`}
          />
        </dl>
      </CardContent>
    </Card>
  )
}

function TradesCard({ trades }: { trades: BacktestTrade[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="py-4">
        <CardTitle className="text-sm">Trades ({formatNumber(trades.length)})</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signal</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Exit</TableHead>
            <TableHead className="text-right">Entry price</TableHead>
            <TableHead className="text-right">Exit price</TableHead>
            <TableHead className="text-right">Return</TableHead>
            <TableHead className="text-right">Holding</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={`${trade.entryTime}-${trade.exitTime}`}>
              <TableCell>{formatDateTime(trade.signalTime)}</TableCell>
              <TableCell>{formatDateTime(trade.entryTime)}</TableCell>
              <TableCell>{formatDateTime(trade.exitTime)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(trade.entryPrice)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(trade.exitPrice)}
              </TableCell>
              <TableCell className="text-right">
                <DeltaValue value={trade.returnPct} showIcon={false}>
                  {formatPercent(trade.returnPct, { signed: true })}
                </DeltaValue>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatNumber(trade.holdingPeriod)} sessions
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? 'truncate font-mono text-xs' : 'text-sm'}>{value}</dd>
    </div>
  )
}

function formatOptionalPercent(value: number | undefined) {
  return value == null ? '—' : formatPercent(value, { signed: true })
}
