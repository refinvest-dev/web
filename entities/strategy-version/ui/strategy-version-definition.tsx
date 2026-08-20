import type { StrategyVersion } from '../model/types'

/**
 * Reusable, presentation-only definition list for a single StrategyVersion.
 * Renders only fields defined by the contract; `conditions` is opaque DSL
 * (owned by the compute engine), so it is summarized by count.
 */
export function StrategyVersionDefinition({
  version,
}: {
  version: StrategyVersion
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      <Item label="Primary signal asset">
        <span className="font-mono text-sm">{version.primarySignalAsset}</span>
      </Item>
      <Item label="Execution asset">
        <span className="font-mono text-sm">{version.executionAsset}</span>
      </Item>
      <Item label="Conditions">
        <span className="tabular-nums">{version.conditions.length}</span>
      </Item>
      <Item label="Signal lag (sessions)">
        <span className="tabular-nums">{version.lag}</span>
      </Item>
      <Item label="Holding period (sessions)">
        <span className="tabular-nums">{version.exit.holdingSignalSessions}</span>
      </Item>
    </dl>
  )
}

function Item({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}
