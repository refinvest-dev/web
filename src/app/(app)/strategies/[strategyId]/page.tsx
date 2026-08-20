import { StrategyDetailPage } from '@/screens/strategy-detail/ui/strategy-detail-page'

export default function Page({
  params,
}: {
  params: Promise<{ strategyId: string }>
}) {
  return <StrategyDetailPage params={params} />
}
