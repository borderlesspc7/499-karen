import { useCallback, useState } from 'react'
import { Alert, ScrollView, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Facebook, Instagram, Linkedin, Store, type LucideIcon } from 'lucide-react-native'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type IntegrationId = 'instagram' | 'facebook' | 'linkedin' | 'google'

type Integration = {
  id: IntegrationId
  name: string
  icon: LucideIcon
  accentColor: string
}

const INTEGRATIONS: Integration[] = [
  { id: 'instagram', name: 'Instagram Business', icon: Instagram, accentColor: '#DB2777' },
  { id: 'facebook', name: 'Facebook Page', icon: Facebook, accentColor: '#1877F2' },
  { id: 'linkedin', name: 'LinkedIn Profile', icon: Linkedin, accentColor: '#0A66C2' },
  { id: 'google', name: 'Google Business Profile', icon: Store, accentColor: '#EA4335' },
]

const INITIAL_CONNECTION_STATE: Record<IntegrationId, boolean> = {
  instagram: false,
  facebook: false,
  linkedin: false,
  google: false,
}

export default function IntegrationsScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const [connected, setConnected] = useState(INITIAL_CONNECTION_STATE)

  const handleToggle = useCallback((integration: Integration, value: boolean) => {
    if (!value) {
      setConnected((current) => ({ ...current, [integration.id]: false }))
      return
    }

    Alert.alert(
      'Conexão de Canais',
      `Autenticando com ${integration.name}...`,
      [
        {
          text: 'OK',
          onPress: () => {
            setConnected((current) => ({ ...current, [integration.id]: true }))
          },
        },
      ],
      { cancelable: false },
    )
  }, [])

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
        <View className="gap-2">
          <Text className="text-3xl font-bold text-white">Conecte seu Ecossistema</Text>
          <Text className="text-sm leading-5 text-white/60">
            Vincule suas contas para permitir que a AI Workforce publique e responda
            automaticamente.
          </Text>
        </View>

        <View className="gap-3">
          {INTEGRATIONS.map((integration) => {
            const Icon = integration.icon
            const isConnected = connected[integration.id]

            return (
              <View
                key={integration.id}
                className="flex-row items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${integration.accentColor}22` }}
                >
                  <Icon size={22} color={integration.accentColor} />
                </View>

                <View className="flex-1 gap-1">
                  <Text className="text-base font-semibold text-white">{integration.name}</Text>
                  {isConnected ? (
                    <View className="self-start rounded-full bg-emerald/15 px-2.5 py-0.5">
                      <Text className="text-[11px] font-bold text-emerald">Conectado</Text>
                    </View>
                  ) : null}
                </View>

                <Switch
                  value={isConnected}
                  onValueChange={(value) => handleToggle(integration, value)}
                  trackColor={{ false: '#334155', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#334155"
                />
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
