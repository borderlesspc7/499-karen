import { useCallback, useEffect, useMemo } from 'react'
import { ActivityIndicator, Alert, ScrollView, Switch, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native'
import type { MessagingChannel } from '@shared/types'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { useChannelConnections } from '@/hooks/useChannelConnections'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { platformEntering } from '@/lib/platform-animation'
import { triggerLightHaptic } from '@/lib/haptics'

type Integration = {
  id: MessagingChannel
  name: string
  description: string
  icon: LucideIcon
  accentColor: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Receba e responda mensagens no inbox omnichannel',
    icon: MessageCircle,
    accentColor: '#16A34A',
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'DMs do Instagram Business sincronizadas em tempo real',
    icon: Instagram,
    accentColor: '#DB2777',
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description: 'Mensagens da sua Página no inbox unificado',
    icon: Facebook,
    accentColor: '#1877F2',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Conexão de conta — inbox sujeito à API de parceiros LinkedIn',
    icon: Linkedin,
    accentColor: '#0A66C2',
  },
]

const STAGGER_MS = 70
const ENTER_DURATION_MS = 420

export default function IntegrationsScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ status?: string; channel?: string; message?: string }>()
  const { connections, isLoading, isConnecting, connectChannel, disconnectChannel, reload } =
    useChannelConnections()

  useEffect(() => {
    if (params.status === 'connected' && params.channel) {
      Alert.alert('Canal conectado', `${params.channel} foi vinculado com sucesso.`)
      void reload()
    }

    if (params.status === 'error') {
      Alert.alert(
        'Falha na conexão',
        params.message ? decodeURIComponent(String(params.message)) : 'Não foi possível conectar o canal.',
      )
      void reload()
    }
  }, [params.channel, params.message, params.status, reload])

  const hasConnectedChannel = useMemo(
    () => Object.values(connections).some((connection) => connection.status === 'connected'),
    [connections],
  )

  const handleAdvanceToCampaign = useCallback(() => {
    router.push('/(tabs)/campaign-magic')
  }, [])

  const handleToggle = useCallback(
    async (integration: Integration, value: boolean) => {
      triggerLightHaptic()

      if (!value) {
        try {
          await disconnectChannel(integration.id)
        } catch {
          // erro já tratado no hook
        }
        return
      }

      Alert.alert(
        'Conectar canal',
        `Você será redirecionado para autenticar com ${integration.name}. As conversas passarão a aparecer no Inbox.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              void connectChannel(integration.id).catch(() => undefined)
            },
          },
        ],
      )
    },
    [connectChannel, disconnectChannel],
  )

  if (isLoading) {
    return (
      <ThemedScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C5A059" />
        </View>
      </ThemedScreen>
    )
  }

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-4',
          isWebDesktop ? 'px-8' : 'px-5',
          hasConnectedChannel ? 'pb-28' : '',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <DesktopContent maxWidth="4xl" className="gap-6">
        <Animated.View
          entering={platformEntering(FadeInDown.duration(ENTER_DURATION_MS))}
          className="gap-2"
        >
          <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>
            Conecte seu Ecossistema
          </Text>
          <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
            Vincule WhatsApp, Instagram, Facebook e LinkedIn. Todas as conversas das redes
            aparecem no Inbox para você responder pelo app.
          </Text>
        </Animated.View>

        <View className={isWebDesktop ? 'flex-row flex-wrap gap-3' : 'gap-3'}>
          {INTEGRATIONS.map((integration, index) => {
            const Icon = integration.icon
            const connection = connections[integration.id]
            const isConnected = connection.status === 'connected'
            const isPending = connection.status === 'pending' || isConnecting === integration.id
            const hasError = connection.status === 'error'

            return (
              <Animated.View
                key={integration.id}
                entering={platformEntering(
                  FadeInDown.delay(STAGGER_MS * (index + 1)).duration(ENTER_DURATION_MS),
                )}
                className={[
                  'gap-3 p-4',
                  tc.cardLg,
                  isWebDesktop ? 'min-w-[calc(50%-6px)] flex-1' : 'w-full',
                ].join(' ')}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${integration.accentColor}22` }}
                  >
                    <Icon size={22} color={integration.accentColor} />
                  </View>

                  <View className="flex-1 gap-1">
                    <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
                      {integration.name}
                    </Text>
                    <Text className={['text-xs leading-4', tc.textSecondary].join(' ')}>
                      {integration.description}
                    </Text>
                    {isConnected ? (
                      <View className="mt-1 self-start rounded-full bg-emerald/15 px-2.5 py-0.5">
                        <Text className="text-[11px] font-bold text-emerald">
                          {connection.externalAccountName ?? 'Conectado'}
                        </Text>
                      </View>
                    ) : null}
                    {isPending ? (
                      <Text className="mt-1 text-[11px] font-medium text-gold">Conectando…</Text>
                    ) : null}
                    {hasError ? (
                      <Text className="mt-1 text-[11px] font-medium text-rose-400">
                        {connection.errorMessage ?? 'Erro na conexão'}
                      </Text>
                    ) : null}
                  </View>

                  <Switch
                    value={isConnected}
                    disabled={isPending}
                    onValueChange={(value) => void handleToggle(integration, value)}
                    trackColor={{ false: '#334155', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#334155"
                  />
                </View>
              </Animated.View>
            )
          })}
        </View>
        </DesktopContent>
      </ScrollView>

      {hasConnectedChannel ? (
        <Animated.View
          entering={platformEntering(FadeInUp.springify().damping(16).stiffness(140))}
          className={['border-t px-5 pt-4', tc.divider, isWebDesktop ? 'px-8' : ''].join(' ')}
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <DesktopContent maxWidth="4xl" className="gap-3">
          <AnimatedPressable
            onPress={() => router.push('/(tabs)/inbox')}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-navy py-4"
          >
            <Text className="text-base font-bold text-white">Abrir Inbox Omnichannel</Text>
            <MessageCircle size={18} color="#C5A059" />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={handleAdvanceToCampaign}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4"
          >
            <Text className="text-base font-bold text-deepBlue">Avançar: Criar Campanha</Text>
            <Sparkles size={18} color="#0F172A" />
          </AnimatedPressable>
          </DesktopContent>
        </Animated.View>
      ) : null}
    </ThemedScreen>
  )
}
