import { StrategyVersionDetailPage } from '@/screens/strategy-version-detail/ui/strategy-version-detail-page'

export default function Page({
  params,
}: {
  params: Promise<{ strategyId: string; versionId: string }>
}) {
  return <StrategyVersionDetailPage params={params} />
}
