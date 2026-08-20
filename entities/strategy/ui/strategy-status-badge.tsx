import { StatusBadge } from '@/components/shared/status-badge'
import { strategyConfigState, type StrategySummary } from '../model/types'

/**
 * Reusable presentational badge for a strategy's configuration state,
 * derived from the contract's `latestVersionId`.
 */
export function StrategyStatusBadge({
  strategy,
}: {
  strategy: Pick<StrategySummary, 'latestVersionId'>
}) {
  const state = strategyConfigState(strategy)
  return (
    <StatusBadge tone={state === 'configured' ? 'paper' : 'neutral'}>
      {state}
    </StatusBadge>
  )
}
