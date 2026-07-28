import { Pressable, Text, View } from 'react-native'
import { Link, usePathname } from 'expo-router'
import {
  BarChart3,
  Bot,
  Home,
  Inbox,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react-native'
import { useAuth, useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'

const mainNavItems: {
  href: '/(tabs)' | '/(tabs)/opportunities' | '/(tabs)/clientes' | '/(tabs)/workforce' | '/(tabs)/inbox' | '/(tabs)/settings'
  labelKey: TranslationKey
  icon: typeof Home
  match: (path: string) => boolean
}[] = [
  { href: '/(tabs)', labelKey: 'nav.home', icon: Home, match: (path) => path === '/' || path === '/index' || path.endsWith('/(tabs)') },
  { href: '/(tabs)/opportunities', labelKey: 'nav.crm', icon: TrendingUp, match: (path) => path.includes('opportunities') || path.includes('/crm') },
  { href: '/(tabs)/clientes', labelKey: 'nav.clients', icon: Users, match: (path) => path.includes('clientes') },
  { href: '/(tabs)/workforce', labelKey: 'nav.engines', icon: Bot, match: (path) => path.includes('workforce') },
  { href: '/(tabs)/inbox', labelKey: 'nav.inbox', icon: Inbox, match: (path) => path.includes('inbox') || path.includes('conversations') },
  { href: '/(tabs)/settings', labelKey: 'nav.settings', icon: Settings, match: (path) => path.includes('settings') },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser } = useAuth()
  const { t } = useTranslation()
  const userLabel = currentUser?.email.split('@')[0] ?? t('home.teamFallback')

  return (
    <View className="h-full w-64 border-r border-slate-200 bg-white px-4 py-6">
      <View className="mb-8 px-2">
        <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Summus Edge
        </Text>
        <Text className="mt-1 text-xl font-semibold text-slate-900">
          {t('nav.meridian')}
        </Text>
        <Text className="mt-1 text-sm text-slate-500">{t('home.helloUser', { name: userLabel })}</Text>
      </View>

      <View className="gap-1">
        {mainNavItems.map((item) => {
          const isActive = item.match(pathname)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                className={[
                  'flex-row items-center gap-3 rounded-2xl px-3 py-3',
                  isActive ? 'bg-violet-50' : 'bg-transparent',
                ].join(' ')}
              >
                <Icon size={18} color={isActive ? '#7c3aed' : '#64748b'} />
                <Text
                  className={[
                    'text-sm font-medium',
                    isActive ? 'text-violet-700' : 'text-slate-600',
                  ].join(' ')}
                >
                  {t(item.labelKey)}
                </Text>
              </Pressable>
            </Link>
          )
        })}
      </View>

      <View className="mt-6 border-t border-slate-100 pt-6">
        <Link href="/reports" asChild>
          <Pressable className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
            <BarChart3 size={18} color="#64748b" />
            <Text className="text-sm font-medium text-slate-600">{t('nav.reports')}</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
