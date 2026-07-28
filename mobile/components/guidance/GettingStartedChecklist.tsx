import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { CheckCircle2, Circle, ListChecks } from 'lucide-react-native'
import { getStorage } from '@shared/storage'
import { useAuth, useGamification, useTranslation } from '@shared/contexts'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useChannelConnections } from '@/hooks/useChannelConnections'

const CHECKLIST_DISMISS_PREFIX = 'summus_checklist_dismiss_v1:'

type ChecklistItem = {
  id: string
  label: string
  hint: string
  done: boolean
  href:
    | '/(tabs)/integrations'
    | '/(tabs)/campaign-magic'
    | '/(tabs)/opportunities'
    | '/(tabs)/inbox'
    | '/(tabs)/settings'
}

export function GettingStartedChecklist() {
  const { currentUser } = useAuth()
  const { isOnboardingComplete, brandIdentity } = useGamification()
  const { connections, isLoading: isChannelsLoading } = useChannelConnections()
  const { t } = useTranslation()
  const tc = useThemeClasses()
  const [isDismissed, setIsDismissed] = useState(true)

  const storageKey = useMemo(
    () => (currentUser ? `${CHECKLIST_DISMISS_PREFIX}${currentUser.id}` : null),
    [currentUser],
  )

  useEffect(() => {
    if (!storageKey) return

    let cancelled = false
    void (async () => {
      try {
        const value = await getStorage().getItem(storageKey)
        if (!cancelled) {
          setIsDismissed(value === '1')
        }
      } catch {
        if (!cancelled) setIsDismissed(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [storageKey])

  const hasConnectedChannel = useMemo(() => {
    if (isChannelsLoading) return false
    return Object.values(connections).some((channel) => channel.status === 'connected')
  }, [connections, isChannelsLoading])

  const items = useMemo<ChecklistItem[]>(
    () => [
      {
        id: 'brand',
        label: t('checklist.brandLabel'),
        hint: brandIdentity?.companyName
          ? t('checklist.brandHintDone', { name: brandIdentity.companyName })
          : t('checklist.brandHintTodo'),
        done: isOnboardingComplete && Boolean(brandIdentity?.companyName?.trim()),
        href: '/(tabs)/settings',
      },
      {
        id: 'channel',
        label: t('checklist.channelLabel'),
        hint: t('checklist.channelHint'),
        done: hasConnectedChannel,
        href: '/(tabs)/integrations',
      },
      {
        id: 'campaign',
        label: t('checklist.campaignLabel'),
        hint: t('checklist.campaignHint'),
        done: false,
        href: '/(tabs)/campaign-magic',
      },
      {
        id: 'pipeline',
        label: t('checklist.pipelineLabel'),
        hint: t('checklist.pipelineHint'),
        done: false,
        href: '/(tabs)/opportunities',
      },
    ],
    [brandIdentity?.companyName, hasConnectedChannel, isOnboardingComplete, t],
  )

  const completedCount = items.filter((item) => item.done).length
  const allDone = completedCount === items.length

  const handleDismiss = useCallback(async () => {
    setIsDismissed(true)
    if (storageKey) {
      try {
        await getStorage().setItem(storageKey, '1')
      } catch {
        // best-effort
      }
    }
  }, [storageKey])

  if (isDismissed || allDone || !isOnboardingComplete) {
    return null
  }

  return (
    <View className={['overflow-hidden rounded-3xl border p-5', tc.cardLg].join(' ')}>
      <View className="mb-4 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-gold/15">
          <ListChecks size={18} color={premiumColors.gold} />
        </View>
        <View className="flex-1">
          <Text className={['text-base font-bold', tc.textPrimary].join(' ')}>
            {t('checklist.title')}
          </Text>
          <Text className={['text-sm', tc.textSecondary].join(' ')}>
            {t('checklist.progress', { done: completedCount, total: items.length })}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.href)}
            className={[
              'flex-row items-start gap-3 rounded-2xl border px-3 py-3 active:opacity-80',
              tc.isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50',
            ].join(' ')}
          >
            {item.done ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <Circle size={20} color={tc.isDark ? '#64748b' : '#94a3b8'} />
            )}
            <View className="flex-1">
              <Text
                className={[
                  'text-sm font-semibold',
                  item.done ? tc.textMuted : tc.textPrimary,
                ].join(' ')}
              >
                {item.label}
              </Text>
              <Text className={['mt-0.5 text-xs', tc.textMuted].join(' ')}>{item.hint}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleDismiss} className="mt-4 py-2">
        <Text className={['text-center text-xs font-medium', tc.textMuted].join(' ')}>
          {t('checklist.dismiss')}
        </Text>
      </Pressable>
    </View>
  )
}
