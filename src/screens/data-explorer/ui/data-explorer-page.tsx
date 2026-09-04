'use client'

import { useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useAssetsQuery, useAssetSeriesQuery } from '@/entities/asset/api/queries'
import type { SeriesMetric } from '@/entities/asset/model/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'

const colors = ['var(--chart-1)', 'var(--chart-2)']

export function DataExplorerPage() {
  const [symbols, setSymbols] = useState(['QQQ', 'SPY'])
  const [metric, setMetric] = useState<SeriesMetric>('NORMALIZED')
  const [start, setStart] = useState('2024-01-01')
  const [end, setEnd] = useState('2024-03-31')
  const assetsQuery = useAssetsQuery()
  const seriesQuery = useAssetSeriesQuery({ symbols, metric, start, end })
  const chartData = seriesQuery.data?.series[0]?.points.map((point, index) => Object.assign({ date: point.date }, ...seriesQuery.data!.series.map((series) => ({ [series.symbol]: series.points[index]?.value })))) ?? []
  const config = Object.fromEntries((seriesQuery.data?.series ?? []).map((series, index) => [series.symbol, { label: series.symbol, color: colors[index % colors.length] }])) satisfies ChartConfig

  return <main className="flex flex-1 flex-col gap-4 p-4 md:p-6"><Card><CardHeader><CardTitle>Data Explorer</CardTitle><CardDescription>Compare published Asset series before defining a strategy.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex flex-wrap gap-3"><Select value={metric} onValueChange={(value) => { if (value === 'PRICE' || value === 'RETURN' || value === 'NORMALIZED') setMetric(value) }}><SelectTrigger aria-label="Series metric"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PRICE">Price</SelectItem><SelectItem value="RETURN">Daily return</SelectItem><SelectItem value="NORMALIZED">Normalized</SelectItem></SelectContent></Select><Input type="date" aria-label="Series start" value={start} onChange={(e) => setStart(e.target.value)} className="w-auto" /><Input type="date" aria-label="Series end" value={end} onChange={(e) => setEnd(e.target.value)} className="w-auto" /></div><div className="flex flex-wrap gap-3">{assetsQuery.data?.assets.map((asset) => <label key={asset.symbol} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={symbols.includes(asset.symbol)} onChange={() => setSymbols((current) => current.includes(asset.symbol) ? current.filter((symbol) => symbol !== asset.symbol) : current.length < 2 ? [...current, asset.symbol] : current)} />{asset.symbol}</label>)}</div></CardContent></Card>{seriesQuery.isError ? <p className="text-sm text-destructive">Couldn&apos;t load the selected series. Adjust the range and try again.</p> : seriesQuery.isPending ? <p className="text-sm text-muted-foreground">Loading series…</p> : <Card><CardContent className="pt-6">{chartData.length ? <ChartContainer config={config} className="aspect-auto h-80 w-full"><LineChart data={chartData}><CartesianGrid vertical={false} /><XAxis dataKey="date" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} />{(seriesQuery.data?.series ?? []).map((series) => <Line key={series.symbol} dataKey={series.symbol} stroke={`var(--color-${series.symbol})`} dot={false} />)}</LineChart></ChartContainer> : <p className="text-sm text-muted-foreground">Select one or two Assets and a valid date range.</p>}</CardContent></Card>}</main>
}
