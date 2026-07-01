import { useCallback, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { type Href, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Link2,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useAuth, useGamification } from '@shared/contexts'

const STAGGER_MS = 70
const ENTER_DURATION_MS = 420

type MenuItem = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  accentColor: string
  href: Href
}

const ACCOUNT_MENU: MenuItem[] = [
  {
    id: 'settings',
    label: 'Configurações',
    description: 'Empresa, segurança, equipe e faturamento',
    icon: Settings,
    accentColor: '#3B82F6',
    href: '/(tabs)/settings',
  },
  {
    id: 'integrations',
    label: 'Canais conectados',
    description: 'Instagram, Facebook, LinkedIn e Google',
    icon: Link2,
    accentColor: '#10B981',
    href: '/(tabs)/integrations',
  },
  {
    id: 'security',
    label: 'Segurança da conta',
    description: 'Senha, sessões e autenticação',
    icon: Shield,
    accentColor: '#8B5CF6',
    href: '/(tabs)/settings',
  },
]

function resolveDisplayName(email?: string | null): string {
  if (!email) {
    return 'Usuário'
  }

  const localPart = email.split('@')[0] ?? 'Usuário'
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

function resolveInitials(displayName: string): string {
  return displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatXp(value: number): string {
  return value.toLocaleString('pt-BR')
}

export default function ProfileScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { currentUser, signOutUser } = useAuth()
  const {
    level,
    title,
    currentXp,
    maxXp,
    xpProgress,
    streakDays,
    completedActions,
    influencePoints,
    userProfile,
    brandIdentity,
    companyStage,
    companyTier,
  } = useGamification()

  const displayName = useMemo(() => resolveDisplayName(currentUser?.email), [currentUser?.email])
  const initials = useMemo(() => resolveInitials(displayName), [displayName])
  const email = currentUser?.email ?? '—'

  const handleNavigate = useCallback((href: Href) => {
    router.push(href)
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOutUser()
  }, [signOutUser])

  return (
    <SafeAreaView className="flex-1 bg-deepBlue" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-4',
          isWebDesktop ? 'mx-auto w-full max-w-2xl px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(ENTER_DURATION_MS)} className="gap-2">
          <AnimatedPressable
            onPress={() => router.back()}
            haptic={false}
            className="mb-1 flex-row items-center gap-1 self-start"
          >
            <ChevronLeft size={18} color="#94A3B8" />
            <Text className="text-sm font-medium text-white/50">Voltar</Text>
          </AnimatedPressable>

          <View className="flex-row items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
            <User size={12} color="#F59E0B" />
            <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
              Minha Conta
            </Text>
          </View>
          <Text className="text-3xl font-bold text-white">Área do Usuário</Text>
          <Text className="text-sm leading-5 text-white/60">
            Gerencie seu perfil, progresso e preferências da plataforma.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(STAGGER_MS).duration(ENTER_DURATION_MS)}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-electricBlue/10" />

          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold/40 bg-white/10">
              <Text className="text-xl font-bold text-gold">{initials}</Text>
            </View>

            <View className="flex-1 gap-1">
              <Text className="text-xl font-bold text-white">
                {brandIdentity?.companyName ?? displayName}
              </Text>
              <Text className="text-sm text-white/50">{email}</Text>
              <View className="mt-1 flex-row flex-wrap gap-2">
                <View className="rounded-full bg-gold/15 px-2.5 py-0.5">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    Elite Plan
                  </Text>
                </View>
                {userProfile ? (
                  <View className="rounded-full bg-electricBlue/15 px-2.5 py-0.5">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-electricBlue">
                      {userProfile}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-5 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-white/70">
                Level {level} · {title}
              </Text>
              <Text className="text-xs font-medium text-white/45">
                {formatXp(currentXp)} / {formatXp(maxXp)} XP
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-white/10">
              <View
                className="h-full rounded-full bg-gold"
                style={{ width: `${Math.round(xpProgress * 100)}%` }}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(STAGGER_MS * 2).duration(ENTER_DURATION_MS)}
          className="flex-row gap-3"
        >
          {[
            { icon: Flame, label: 'Streak', value: `${streakDays}d`, color: '#F59E0B' },
            { icon: Trophy, label: 'Ações', value: String(completedActions), color: '#3B82F6' },
            { icon: Sparkles, label: 'Influência', value: String(influencePoints), color: '#10B981' },
          ].map((stat) => {
            const Icon = stat.icon

            return (
              <View
                key={stat.label}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-4"
              >
                <View
                  className="mb-2 h-8 w-8 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${stat.color}22` }}
                >
                  <Icon size={16} color={stat.color} />
                </View>
                <Text className="text-lg font-bold text-white">{stat.value}</Text>
                <Text className="text-[11px] font-medium text-white/45">{stat.label}</Text>
              </View>
            )
          })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(STAGGER_MS * 3).duration(ENTER_DURATION_MS)}
          className="rounded-3xl border border-white/10 bg-white/5 p-4"
        >
          <Text className="text-xs font-bold uppercase tracking-wider text-white/40">
            Empresa
          </Text>
          <Text className="mt-2 text-base font-semibold text-white">{companyStage}</Text>
          <Text className="mt-1 text-sm text-white/50">Tier {companyTier}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(STAGGER_MS * 4).duration(ENTER_DURATION_MS)}
          className="gap-2"
        >
          <Text className="text-sm font-semibold text-white/70">Acesso rápido</Text>

          {ACCOUNT_MENU.map((item, index) => {
            const Icon = item.icon

            return (
              <AnimatedPressable
                key={item.id}
                onPress={() => handleNavigate(item.href)}
                haptic={false}
                className="flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                style={{ marginTop: index === 0 ? 0 : 0 }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.accentColor}22` }}
                >
                  <Icon size={20} color={item.accentColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">{item.label}</Text>
                  <Text className="mt-0.5 text-xs text-white/45">{item.description}</Text>
                </View>
                <ChevronRight size={18} color="#64748B" />
              </AnimatedPressable>
            )
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(STAGGER_MS * 5).duration(ENTER_DURATION_MS)}>
          <AnimatedPressable
            onPress={handleSignOut}
            haptic={false}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-4"
          >
            <LogOut size={18} color="#F87171" />
            <Text className="text-sm font-bold text-red-400">Sair da conta</Text>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
