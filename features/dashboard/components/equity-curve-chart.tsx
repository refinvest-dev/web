'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format'
import { equityCurve } from '../data'

const chartConfig = {
  equity: {
    label: 'Equity',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function monthLabel(value: string) {
  const [year, month] = value.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

export function EquityCurveChart() {
  return (
    <Card className="gap-4">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="grid gap-1">
          <CardTitle className="text-sm">Equity Curve</CardTitle>
          <CardDescription>Portfolio value over the last 12 months</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={equityCurve} margin={{ left: 4, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="fillEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-equity)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-equity)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={monthLabel}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickMargin={4}
              tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
              domain={['dataMin - 4000', 'dataMax + 4000']}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    payload?.[0]
                      ? monthLabel(String(payload[0].payload.date)) +
                        ' ' +
                        String(payload[0].payload.date).split('-')[0]
                      : ''
                  }
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">Equity</span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="equity"
              type="monotone"
              stroke="var(--color-equity)"
              strokeWidth={2}
              fill="url(#fillEquity)"
              dot={false}
              activeDot={{ r: 3 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
