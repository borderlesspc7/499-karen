import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native'
import { Zap } from 'lucide-react-native'
import { automationTemplates } from '@shared/data'
import type { Automation } from '@shared/types'
import { useAuth } from '@shared/contexts'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { getAutomationRepository } from '@/lib/firestore-automation-repository'

export default function AutomationsScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { currentUser } = useAuth()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAutomations = useCallback(async () => {
    if (!currentUser?.id) {
      setAutomations([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const items = await getAutomationRepository().listByUser(currentUser.id)
      setAutomations(items)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar as automações.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    void loadAutomations()
  }, [loadAutomations])

  async function handleToggle(automation: Automation, enabled: boolean) {
    if (!currentUser?.id) return

    setAutomations((current) =>
      current.map((item) => (item.id === automation.id ? { ...item, enabled } : item)),
    )

    try {
      await getAutomationRepository().setEnabled(currentUser.id, automation.id, enabled)
    } catch {
      void loadAutomations()
    }
  }

  async function handleActivateTemplate(templateId: string) {
    if (!currentUser?.id || isSaving) return

    const template = automationTemplates.find((item) => item.id === templateId)
    if (!template) return

    const alreadyExists = automations.some(
      (item) => item.trigger === template.trigger && item.action === template.action,
    )
    if (alreadyExists) {
      setError('Essa automação já está ativa na sua conta.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await getAutomationRepository().create({
        userId: currentUser.id,
        title: template.title,
        description: template.description,
        trigger: template.trigger,
        action: template.action,
        enabled: true,
      })
      await loadAutomations()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível ativar a automação.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-6',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => void loadAutomations()} />
        }
        showsVerticalScrollIndicator={false}
      >
        <DesktopContent maxWidth="4xl" className="gap-6">
          <View className="gap-2">
            <View className="self-start flex-row items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5">
              <Zap size={14} color="#7c3aed" />
              <Text className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                Automações
              </Text>
            </View>
            <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
              Fluxos ativos
            </Text>
            <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
              Automações persistidas no Firestore da sua conta — sem dados demo.
            </Text>
          </View>

          {error ? (
            <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#7c3aed" />
            </View>
          ) : automations.length === 0 ? (
            <View className={['rounded-3xl border border-dashed p-6', tc.emptyState].join(' ')}>
              <Text className={['text-base font-medium', tc.textPrimary].join(' ')}>
                Nenhuma automação ativa
              </Text>
              <Text className={['mt-2 text-sm', tc.textSecondary].join(' ')}>
                Ative um template abaixo para gravar no Firestore.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {automations.map((automation) => (
                <View
                  key={automation.id}
                  className={[
                    'rounded-3xl border p-4',
                    tc.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
                  ].join(' ')}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
                        {automation.title}
                      </Text>
                      <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
                        {automation.description}
                      </Text>
                      <Text className={['mt-2 text-xs', tc.textSecondary].join(' ')}>
                        Disparada {automation.runCount}x
                        {automation.lastRunAt
                          ? ` · última em ${new Date(automation.lastRunAt).toLocaleString('pt-BR')}`
                          : ' · ainda não executada'}
                      </Text>
                    </View>
                    <Switch
                      value={automation.enabled}
                      onValueChange={(enabled) => void handleToggle(automation, enabled)}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="gap-3">
            <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>Templates</Text>
            {automationTemplates.map((template) => (
              <View
                key={template.id}
                className={[
                  'rounded-3xl border p-4',
                  tc.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
                  {template.title}
                </Text>
                <Text className={['mt-1 text-sm', tc.textSecondary].join(' ')}>
                  {template.description}
                </Text>
                <Pressable
                  onPress={() => void handleActivateTemplate(template.id)}
                  disabled={isSaving}
                  className="mt-4 self-start rounded-2xl bg-violet-600 px-4 py-2.5 active:opacity-80"
                >
                  <Text className="text-sm font-semibold text-white">
                    {isSaving ? 'Ativando...' : 'Ativar no Firestore'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </DesktopContent>
      </ScrollView>
    </ThemedScreen>
  )
}
