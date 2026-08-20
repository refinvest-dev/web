import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { directionOf } from '@/lib/format'

interface DeltaValueProps {
  /** The raw numeric value; sign determines direction. */
  value: number
  /** Preformatted label to display (e.g. "+12.4%" or "+$1,204"). */
  children: React.ReactNode
  /** Show a directional arrow icon. */
  showIcon?: boolean
  className?: string
}

/**
 * Renders a financial figure colored by direction using semantic
 * `financial-positive` / `financial-negative` tokens. Direction is also
 * conveyed by an arrow icon and the value's own sign — never color alone.
 */
export function DeltaValue({
  value,
  children,
  showIcon = true,
  className,
}: DeltaValueProps) {
  const direction = directionOf(value)
  const Icon = direction === 'negative' ? ArrowDownRight : ArrowUpRight

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono tabular-nums',
        direction === 'positive' && 'text-financial-positive',
        direction === 'negative' && 'text-financial-negative',
        direction === 'neutral' && 'text-muted-foreground',
        className,
      )}
    >
      {showIcon && direction !== 'neutral' && (
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
