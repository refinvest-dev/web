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
import {
  createTradeTimeline,
  deriveDrawdownCurve,
  mergePortfolioCurves,
} from '../model/result-visualization'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

const chartConfig = {
  strategy: { label: 'Strategy', color: 'var(--chart-1)' },
  benchmark: { label: 'Buy & hold', color: 'var(--chart-5)' },
} satisfies ChartConfig

const drawdownChartConfig = {
  strategy: { label: 'Strategy drawdown', color: 'var(--financial-negative)' },
  benchmark: { label: 'Buy & hold drawdown', color: 'var(--chart-5)' },
} satisfies ChartConfig

export function BacktestResultOverview({ result }: { result: BacktestResult }) {
  const { metrics } = result
  const primaryBenchmark = result.benchmark.primary
  const equityCurve = mergePortfolioCurves(result.equityCurve, primaryBenchmark.equityCurve)
  const drawdownCurve = mergePortfolioCurves(
    deriveDrawdownCurve(result.equityCurve),
    deriveDrawdownCurve(primaryBenchmark.equityCurve),
  )
  const leveragedExecutionAsset = ['TQQQ', 'SOXL'].includes(primaryBenchmark.asset)

  return (
    <div className="flex flex-col gap-4">
      {result.sampleSizeWarning === 'ZERO' && <ZeroTradeNotice tradeCount={metrics.tradeCount ?? 0} />}

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

      {leveragedExecutionAsset && <LeveragedAssetWarning asset={primaryBenchmark.asset} />}

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

      <PortfolioChartCard
        title="Equity curve"
        description={`Strategy compared with ${primaryBenchmark.asset} buy & hold`}
        data={equityCurve}
        config={chartConfig}
        formatValue={formatGrowthIndex}
      />

      <PortfolioChartCard
        title="Drawdown"
        description="Derived from each portfolio index; no price series is used."
        data={drawdownCurve}
        config={drawdownChartConfig}
        formatValue={(value) => formatPercent(value, { signed: true })}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <BenchmarkCard result={result} />
        <IntegrityCard result={result} />
      </div>

      <TradeTimeline result={result} />
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

function ZeroTradeNotice({ tradeCount }: { tradeCount: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">No trades in this period</CardTitle>
      </CardHeader>
      <CardContent className="flex items-start gap-3">
        <ChartNoAxesColumnIncreasing className="mt-0.5 size-4 text-muted-foreground" />
        <div className="space-y-1 text-sm">
          <p>The strategy did not produce an entry signal, so performance metrics are unavailable.</p>
          <p className="font-mono text-xs text-muted-foreground">{formatNumber(tradeCount)} trades</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LeveragedAssetWarning({ asset }: { asset: string }) {
  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle>Leveraged ETF notice ({asset})</AlertTitle>
      <AlertDescription>
        TQQQ/SOXL pursue daily leverage targets. Volatility and daily compounding can make long-term results differ from a simple multiple of the underlying index.
      </AlertDescription>
    </Alert>
  )
}

function PortfolioChartCard({
  title,
  description,
  data,
  config,
  formatValue,
}: {
  title: string
  description: string
  data: ReturnType<typeof mergePortfolioCurves>
  config: ChartConfig
  formatValue: (value: number) => string
}) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <LineChart data={data} margin={{ left: 4, right: 8, top: 4 }}>
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
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                width={60}
                tickFormatter={formatValue}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatDate(String(label))}
                    formatter={(value) =>
                      typeof value === 'number' ? formatValue(value) : String(value)
                    }
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="strategy" type="monotone" stroke="var(--color-strategy)" strokeWidth={2} dot={false} connectNulls={false} />
              <Line dataKey="benchmark" type="monotone" stroke="var(--color-benchmark)" strokeWidth={2} dot={false} connectNulls={false} />
            </LineChart>
          </ChartContainer>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No portfolio-index points are available for this result.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function BenchmarkCard({ result }: { result: BacktestResult }) {
  const benchmark = result.benchmark.primary
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{benchmark.asset} buy & hold</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 gap-4">
          <Detail label="Return" value={formatOptionalPercent(benchmark.totalReturn)} />
          <Detail label="CAGR" value={formatOptionalPercent(benchmark.cagr)} />
          <Detail label="Max DD" value={formatOptionalPercent(benchmark.mdd)} />
        </dl>
        {result.benchmark.secondaryReference && (
          <p className="mt-4 text-xs text-muted-foreground">
            Signal asset reference: <span className="font-mono">{result.benchmark.secondaryReference.asset}</span>
          </p>
        )}
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

function TradeTimeline({ result }: { result: BacktestResult }) {
  const events = createTradeTimeline(result.trades)
  const executionAsset = result.benchmark.primary.asset
  const signalAsset = result.benchmark.secondaryReference?.asset ?? executionAsset

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm">Trade timeline</CardTitle>
        {result.signalExecutionMarketRelation === 'CROSS_MARKET' && (
          <Badge variant="outline">Cross-market: {signalAsset} → {executionAsset}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <ol className="space-y-3 border-l border-border pl-4">
            {events.map((event) => (
              <li key={`${event.tradeIndex}-${event.kind}-${event.time}`} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-muted-foreground" aria-hidden />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span>{timelineEventLabel(event.kind, signalAsset, executionAsset)}</span>
                  <time className="font-mono text-xs text-muted-foreground" dateTime={event.time}>
                    {formatDateTime(event.time)}
                  </time>
                </div>
                <p className="text-xs text-muted-foreground">Trade {event.tradeIndex + 1}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No signal, entry, or exit events occurred in this result.</p>
        )}
      </CardContent>
    </Card>
  )
}

function timelineEventLabel(
  kind: 'SIGNAL' | 'ENTRY' | 'EXIT',
  signalAsset: string,
  executionAsset: string,
) {
  if (kind === 'SIGNAL') return `Signal confirmed (${signalAsset})`
  if (kind === 'ENTRY') return `Entered ${executionAsset}`
  return `Exited ${executionAsset}`
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

function formatOptionalPercent(value: number | null | undefined) {
  return value == null ? '—' : formatPercent(value, { signed: true })
}

function formatGrowthIndex(value: number) {
  return formatPercent(value - 1, { signed: true })
}
