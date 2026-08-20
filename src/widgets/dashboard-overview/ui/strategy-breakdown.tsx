import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { StatusBadge } from '@/shared/ui/status-badge'
import { DeltaValue } from '@/shared/ui/delta-value'
import { formatCurrency, formatPercent } from '@/shared/lib/format'
import { strategySummaries } from '../data'

export function StrategyBreakdown() {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-1">
        <CardTitle className="text-sm">Strategy Allocation</CardTitle>
        <CardDescription>Capital split and contribution</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {strategySummaries.map((strategy) => (
          <div key={strategy.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {strategy.name}
                </span>
                <StatusBadge tone={strategy.status}>
                  {strategy.status}
                </StatusBadge>
              </div>
              <DeltaValue
                value={strategy.pnl}
                showIcon={false}
                className="text-sm"
              >
                {formatCurrency(strategy.pnl, { signed: true, compact: true })}
              </DeltaValue>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${strategy.allocationPct}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatPercent(strategy.allocationPct, { digits: 0 })}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
