import type { LucideIcon } from 'lucide-react'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { DeltaValue } from './delta-value'

interface StatCardProps {
  label: string
  value: string
  icon?: LucideIcon
  /** Optional delta shown under the value; sign drives direction coloring. */
  delta?: { value: number; label: string }
  /** Secondary caption when there is no delta. */
  caption?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  caption,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('gap-0 p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-1 min-h-5 text-xs">
        {delta ? (
          <span className="flex items-center gap-1.5">
            <DeltaValue value={delta.value} className="text-xs">
              {delta.label}
            </DeltaValue>
            <span className="text-muted-foreground">vs last month</span>
          </span>
        ) : caption ? (
          <span className="text-muted-foreground">{caption}</span>
        ) : null}
      </div>
    </Card>
  )
}
