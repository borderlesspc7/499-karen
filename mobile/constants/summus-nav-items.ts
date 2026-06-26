import type { LucideIcon } from 'lucide-react-native'
import { BrainCircuit, Inbox, LayoutGrid, TrendingUp } from 'lucide-react-native'

export type SummusNavItem = {
  href: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

export const summusNavItems: SummusNavItem[] = [
  {
    href: '/(tabs)',
    label: 'Home',
    icon: LayoutGrid,
    match: (path) => path === '/' || path === '/index' || path.endsWith('/(tabs)'),
  },
  {
    href: '/(tabs)/opportunities',
    label: 'CRM',
    icon: TrendingUp,
    match: (path) => path.includes('opportunities') || path.includes('/crm'),
  },
  {
    href: '/(tabs)/workforce',
    label: 'Equipe IA',
    icon: BrainCircuit,
    match: (path) => path.includes('workforce'),
  },
  {
    href: '/(tabs)/inbox',
    label: 'Inbox',
    icon: Inbox,
    match: (path) => path.includes('inbox') || path.includes('conversations'),
  },
]
