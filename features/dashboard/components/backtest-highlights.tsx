import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DeltaValue } from '@/components/shared/delta-value'
import { formatDate, formatPercent } from '@/lib/format'
import { backtestSummaries } from '../data'

export function BacktestHighlights() {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-1">
        <CardTitle className="text-sm">Backtest Performance</CardTitle>
        <CardDescription>Most recent strategy runs</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {backtestSummaries.map((bt) => (
          <div
            key={bt.id}
            className="flex flex-col gap-2 rounded-md border border-border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-snug text-pretty">
                {bt.name}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {formatDate(bt.runAt)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Metric label="CAGR">
                <DeltaValue value={bt.cagr} showIcon={false} className="text-sm">
                  {formatPercent(bt.cagr, { signed: true })}
                </DeltaValue>
              </Metric>
              <Metric label="Sharpe">
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {bt.sharpe.toFixed(2)}
                </span>
              </Metric>
              <Metric label="Max DD">
                <DeltaValue
                  value={bt.maxDrawdown}
                  showIcon={false}
                  className="text-sm"
                >
                  {formatPercent(bt.maxDrawdown)}
                </DeltaValue>
              </Metric>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Metric({
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
      {children}
    </div>
  )
}
