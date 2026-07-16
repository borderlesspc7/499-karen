import type { LucideIcon } from 'lucide-react-native'
import { BrainCircuit, Inbox, LayoutGrid, Link2, TrendingUp, Wand2 } from 'lucide-react-native'

export type SummusNavItem = {
  href: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

export const summusNavItems: SummusNavItem[] = [
  {
    href: '/(tabs)',
    label: 'Núcleo',
    icon: LayoutGrid,
    match: (path) => path === '/' || path === '/index' || path.endsWith('/(tabs)'),
  },
  {
    href: '/(tabs)/opportunities',
    label: 'Oportunidades',
    icon: TrendingUp,
    match: (path) => path.includes('opportunities') || path.includes('/crm'),
  },
  {
    href: '/(tabs)/workforce',
    label: 'Motores',
    icon: BrainCircuit,
    match: (path) => path.includes('workforce'),
  },
  {
    href: '/(tabs)/integrations',
    label: 'Canais',
    icon: Link2,
    match: (path) => path.includes('integrations'),
  },
  {
    href: '/(tabs)/campaign-magic',
    label: 'Campanhas',
    icon: Wand2,
    match: (path) => path.includes('campaign-magic'),
  },
  {
    href: '/(tabs)/inbox',
    label: 'Inbox',
    icon: Inbox,
    match: (path) => path.includes('inbox') || path.includes('conversations'),
  },
]
