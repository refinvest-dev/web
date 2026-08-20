import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { formatCurrency, formatDateTime, formatPercent } from '@/lib/format'
import { recentTrades } from '../data'

export function RecentTrades() {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-1">
        <CardTitle className="text-sm">Recent Trades</CardTitle>
        <CardDescription>Last 6 closed positions</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-6">Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="hidden sm:table-cell">Strategy</TableHead>
              <TableHead className="text-right">Return</TableHead>
              <TableHead className="pr-6 text-right">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTrades.map((trade) => (
              <TableRow key={trade.id} className="border-border">
                <TableCell className="pl-6">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-medium">
                      {trade.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(trade.closedAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-mono text-[11px] uppercase',
                      trade.side === 'long'
                        ? 'border-financial-positive/30 text-financial-positive'
                        : 'border-financial-negative/30 text-financial-negative',
                    )}
                  >
                    {trade.side}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                  {trade.strategy}
                </TableCell>
                <TableCell className="text-right">
                  <DeltaValue
                    value={trade.returnPct}
                    showIcon={false}
                    className="justify-end text-sm"
                  >
                    {formatPercent(trade.returnPct, { signed: true })}
                  </DeltaValue>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <DeltaValue
                    value={trade.pnl}
                    showIcon={false}
                    className="justify-end text-sm"
                  >
                    {formatCurrency(trade.pnl, { signed: true })}
                  </DeltaValue>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
