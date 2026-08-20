import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Emphasis badge marking a strategy's current/latest version. Uses the
 * interaction accent (primary) token per DESIGN.md — accent signals selection
 * and is kept distinct from financial-direction colors.
 */
export function StrategyVersionLatestBadge({
  className,
}: {
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 border-primary/30 text-[11px] font-medium text-primary',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      Latest
    </Badge>
  )
}
