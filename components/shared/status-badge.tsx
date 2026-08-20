import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusTone = 'live' | 'paper' | 'paused' | 'neutral'

const toneStyles: Record<StatusTone, string> = {
  live: 'border-financial-positive/30 bg-financial-positive-muted text-financial-positive',
  paper: 'border-info/30 text-info',
  paused: 'border-warning/40 text-warning',
  neutral: 'text-muted-foreground',
}

interface StatusBadgeProps {
  tone: StatusTone
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 text-[11px] font-medium capitalize',
        toneStyles[tone],
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          tone === 'live' && 'bg-financial-positive',
          tone === 'paper' && 'bg-info',
          tone === 'paused' && 'bg-warning',
          tone === 'neutral' && 'bg-muted-foreground',
        )}
        aria-hidden
      />
      {children}
    </Badge>
  )
}
