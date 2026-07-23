import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import {
  ArrowRight,
  Megaphone,
  MessageSquare,
  Radio,
  Sparkles,
  Target,
  X,
} from 'lucide-react-native'
import { getStorage } from '@shared/storage'
import { useAuth } from '@shared/contexts'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const TOUR_STORAGE_PREFIX = 'summus_guided_tour_v1:'

type TourStep = {
  id: string
  title: string
  body: string
  ctaLabel: string
  href?: '/(tabs)' | '/(tabs)/integrations' | '/(tabs)/campaign-magic' | '/(tabs)/opportunities' | '/(tabs)/inbox'
  icon: typeof Sparkles
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Summus',
    body: 'Aqui você entende o que está acontecendo no negócio e decide o próximo passo — sem precisar ser especialista em marketing ou tecnologia.',
    ctaLabel: 'Começar o tour',
    icon: Sparkles,
  },
  {
    id: 'channels',
    title: '1. Conecte seus canais',
    body: 'Instagram, Facebook ou LinkedIn. É por aqui que conversas e oportunidades entram no sistema.',
    ctaLabel: 'Ver canais',
    href: '/(tabs)/integrations',
    icon: Radio,
  },
  {
    id: 'campaigns',
    title: '2. Crie uma campanha',
    body: 'A IA monta textos e ideias para você. Você só revisa e aprova o que faz sentido.',
    ctaLabel: 'Abrir campanhas',
    href: '/(tabs)/campaign-magic',
    icon: Megaphone,
  },
  {
    id: 'opportunities',
    title: '3. Acompanhe oportunidades',
    body: 'Cada lead ou cliente em negociação aparece aqui, em etapas claras — como um quadro de tarefas.',
    ctaLabel: 'Ver oportunidades',
    href: '/(tabs)/opportunities',
    icon: Target,
  },
  {
    id: 'inbox',
    title: '4. Responda no Inbox',
    body: 'Todas as conversas em um só lugar. A IA pode sugerir respostas; você decide o que enviar.',
    ctaLabel: 'Ir ao Inbox',
    href: '/(tabs)/inbox',
    icon: MessageSquare,
  },
]

type GuidedFirstRunProps = {
  enabled: boolean
}

export function GuidedFirstRun({ enabled }: GuidedFirstRunProps) {
  const { currentUser } = useAuth()
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
            <Pressable onPress={dismiss} hitSlop={12} accessibilityLabel="Fechar tour">
              <X size={18} color={tc.isDark ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </View>

          <Text className={['text-xs font-bold uppercase tracking-wider text-gold'].join(' ')}>
            Passo {stepIndex + 1} de {TOUR_STEPS.length}
          </Text>
          <Text className={['mt-2 text-xl font-bold', tc.textPrimary].join(' ')}>{step.title}</Text>
          <Text className={['mt-2 text-sm leading-6', tc.textSecondary].join(' ')}>{step.body}</Text>

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
              {isLast ? 'Concluir e explorar' : step.ctaLabel}
            </Text>
            <ArrowRight size={16} color="#04122C" />
          </Pressable>

          {!isLast ? (
            <Pressable onPress={dismiss} className="mt-3 py-2">
              <Text className={['text-center text-sm', tc.textMuted].join(' ')}>
                Pular introdução
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}
