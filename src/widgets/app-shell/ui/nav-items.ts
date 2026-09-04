import {
  LayoutDashboard,
  Layers,
  FlaskConical,
  ChartNoAxesCombined,
  BookText,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Strategies', href: '/strategies', icon: Layers },
  { title: 'Backtests', href: '/backtests', icon: FlaskConical },
  { title: 'Data Explorer', href: '/data-explorer', icon: ChartNoAxesCombined },
  { title: 'Trading Journal', href: '/journal', icon: BookText },
]
