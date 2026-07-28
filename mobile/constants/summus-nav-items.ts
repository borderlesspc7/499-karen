import type { LucideIcon } from 'lucide-react-native'
import { BrainCircuit, Inbox, LayoutGrid, Link2, TrendingUp, Wand2 } from 'lucide-react-native'
import type { TranslationKey } from '@shared/i18n'

export type SummusNavItem = {
  href: string
  labelKey: TranslationKey
  icon: LucideIcon
  match: (path: string) => boolean
}

export const summusNavItems: SummusNavItem[] = [
  {
    href: '/(tabs)',
    labelKey: 'nav.meridian',
    icon: LayoutGrid,
    match: (path) => path === '/' || path === '/index' || path.endsWith('/(tabs)'),
  },
  {
    href: '/(tabs)/opportunities',
    labelKey: 'nav.opportunities',
    icon: TrendingUp,
    match: (path) => path.includes('opportunities') || path.includes('/crm'),
  },
  {
    href: '/(tabs)/workforce',
    labelKey: 'nav.engines',
    icon: BrainCircuit,
    match: (path) => path.includes('workforce'),
  },
  {
    href: '/(tabs)/integrations',
    labelKey: 'nav.channels',
    icon: Link2,
    match: (path) => path.includes('integrations'),
  },
  {
    href: '/(tabs)/campaign-magic',
    labelKey: 'nav.campaigns',
    icon: Wand2,
    match: (path) => path.includes('campaign-magic'),
  },
  {
    href: '/(tabs)/inbox',
    labelKey: 'nav.inbox',
    icon: Inbox,
    match: (path) => path.includes('inbox') || path.includes('conversations'),
  },
]
