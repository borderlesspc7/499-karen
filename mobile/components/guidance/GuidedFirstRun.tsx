import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import {
  ArrowRight,
  Building2,
  Megaphone,
  MessageSquare,
  Radio,
  Sparkles,
  Target,
  X,
} from 'lucide-react-native'
import { getStorage } from '@shared/storage'
import { useAuth, useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const TOUR_STORAGE_PREFIX = 'summus_guided_tour_v1:'

type TourStepDef = {
  id: string
  titleKey: TranslationKey
  bodyKey: TranslationKey
  ctaKey: TranslationKey
  href?:
    | '/(tabs)'
    | '/(tabs)/integrations'
    | '/(tabs)/campaign-magic'
    | '/(tabs)/opportunities'
    | '/(tabs)/inbox'
    | '/(tabs)/settings'
  icon: typeof Sparkles
}

const TOUR_STEPS: TourStepDef[] = [
  {
    id: 'welcome',
    titleKey: 'tour.welcomeTitle',
    bodyKey: 'tour.welcomeBody',
    ctaKey: 'tour.welcomeCta',
    icon: Sparkles,
  },
  {
    id: 'company',
    titleKey: 'tour.companyTitle',
    bodyKey: 'tour.companyBody',
    ctaKey: 'common.continue',
    icon: Building2,
  },
  {
    id: 'channels',
    titleKey: 'tour.channelsTitle',
    bodyKey: 'tour.channelsBody',
    ctaKey: 'tour.channelsCta',
    href: '/(tabs)/integrations',
    icon: Radio,
  },
  {
    id: 'campaigns',
    titleKey: 'tour.campaignsTitle',
    bodyKey: 'tour.campaignsBody',
    ctaKey: 'tour.campaignsCta',
    href: '/(tabs)/campaign-magic',
    icon: Megaphone,
  },
  {
    id: 'opportunities',
    titleKey: 'tour.oppsTitle',
    bodyKey: 'tour.oppsBody',
    ctaKey: 'home.viewOpportunities',
    href: '/(tabs)/opportunities',
    icon: Target,
  },
  {
    id: 'inbox',
    titleKey: 'tour.inboxTitle',
    bodyKey: 'tour.inboxBody',
    ctaKey: 'tour.inboxCta',
    href: '/(tabs)/inbox',
    icon: MessageSquare,
  },
]

type GuidedFirstRunProps = {
  enabled: boolean
}

export function GuidedFirstRun({ enabled }: GuidedFirstRunProps) {
  const { currentUser } = useAuth()
  const { t } = useTranslation()
  const tc = useThemeClasses()
  const [isVisible, setIsVisible] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const storageKey = useMemo(
    () => (currentUser ? `${TOUR_STORAGE_PREFIX}${currentUser.id}` : null),
    [currentUser],
  )

  useEffect(() => {
    if (!enabled || !storageKey) {
      setIsVisible(false)
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const done = await getStorage().getItem(storageKey)
        if (!cancelled && done !== '1') {
          setIsVisible(true)
          setStepIndex(0)
        }
      } catch {
        if (!cancelled) {
          setIsVisible(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, storageKey])

  const step = TOUR_STEPS[stepIndex]
  const isLast = stepIndex >= TOUR_STEPS.length - 1

  const dismiss = useCallback(async () => {
    setIsVisible(false)
    if (storageKey) {
      try {
        await getStorage().setItem(storageKey, '1')
      } catch {
        // best-effort
      }
    }
  }, [storageKey])

  const handleNext = useCallback(async () => {
    if (!step) return

    if (step.href) {
      router.push(step.href)
    }

    if (isLast) {
      await dismiss()
      return
    }

    setStepIndex((current) => current + 1)
  }, [dismiss, isLast, step])

  if (!isVisible || !step) {
    return null
  }

  const Icon = step.icon

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <View className="flex-1 justify-end bg-black/55 px-4 pb-8 pt-16">
        <View className={['overflow-hidden rounded-3xl border p-5', tc.cardLg].join(' ')}>
          <View className="mb-4 flex-row items-start justify-between">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-gold/15">
              <Icon size={20} color={premiumColors.gold} />
            </View>
            <Pressable onPress={dismiss} hitSlop={12} accessibilityLabel={t('tour.closeA11y')}>
              <X size={18} color={tc.isDark ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </View>

          <Text className={['text-xs font-bold uppercase tracking-wider text-gold'].join(' ')}>
            {t('tour.stepOf', { current: stepIndex + 1, total: TOUR_STEPS.length })}
          </Text>
          <Text className={['mt-2 text-xl font-bold', tc.textPrimary].join(' ')}>
            {t(step.titleKey)}
          </Text>
          <Text className={['mt-2 text-sm leading-6', tc.textSecondary].join(' ')}>
            {t(step.bodyKey)}
          </Text>

          <View className="mt-5 flex-row gap-1.5">
            {TOUR_STEPS.map((item, index) => (
              <View
                key={item.id}
                className={[
                  'h-1.5 flex-1 rounded-full',
                  index <= stepIndex ? 'bg-gold' : tc.isDark ? 'bg-white/15' : 'bg-slate-200',
                ].join(' ')}
              />
            ))}
          </View>

          <Pressable
            onPress={handleNext}
            className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-3.5 active:opacity-90"
          >
            <Text className="text-sm font-bold text-navy">
              {isLast ? t('tour.finish') : t(step.ctaKey)}
            </Text>
            <ArrowRight size={16} color="#04122C" />
          </Pressable>

          {!isLast ? (
            <Pressable onPress={dismiss} className="mt-3 py-2">
              <Text className={['text-center text-sm', tc.textMuted].join(' ')}>
                {t('tour.skip')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}
