import {
  LayoutDashboard,
  Layers,
  FlaskConical,
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
  { title: 'Trading Journal', href: '/journal', icon: BookText },
]
