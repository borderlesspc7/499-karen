import { ScrollView, Text, View } from 'react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { Sparkles } from 'lucide-react-native'
import { useGamification } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { AI_WORKFORCE_AGENTS } from '@/constants/ai-workforce'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { AiWorkforceAgentCard } from '@/components/workforce/AiWorkforceAgentCard'

export default function WorkforceScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { executeAction } = useGamification()

  function handleAssignTask(agentId: string) {
    const actionMap: Record<string, string> = {
      'marketing-therapist': 'rewrite-headline',
      'seo-strategist': 'add-cta',
      'lead-recovery-specialist': 'reactivate-inactive-leads',
      'automation-builder': 'configure-crm',
    }

    executeAction(actionMap[agentId] ?? 'follow-up-leads')
  }

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-6',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="self-start flex-row items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-2">
            <Sparkles size={14} color="#F59E0B" />
            <Text className="text-xs font-bold uppercase tracking-wider text-gold">
              AI Workforce
            </Text>
          </View>

          <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
            AI Workforce
          </Text>
          <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
            Agentes especializados prontos para executar — sem configurar fluxos, apenas atribuir
            tarefas.
          </Text>
        </View>

        <View className="gap-4">
          {AI_WORKFORCE_AGENTS.map((agent) => (
            <AiWorkforceAgentCard
              key={agent.id}
              agent={agent}
              onAssignTask={handleAssignTask}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedScreen>
  )
}
