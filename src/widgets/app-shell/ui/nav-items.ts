import {
  Layers,
  FlaskConical,
  Gauge,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: Record<'en' | 'ko', string>
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: { en: 'Strategies', ko: '전략' }, href: '/strategies', icon: Layers },
  { title: { en: 'Backtests', ko: '백테스트' }, href: '/backtests', icon: FlaskConical },
  { title: { en: 'Usage', ko: '사용량' }, href: '/usage', icon: Gauge },
]
