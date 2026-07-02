import { Alert, Pressable, Text, View } from 'react-native'
import { Bot } from 'lucide-react-native'
import type { AiWorkforceAgent } from '@/constants/ai-workforce'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type AiWorkforceAgentCardProps = {
  agent: AiWorkforceAgent
  onAssignTask?: (agentId: string) => void
}

export function AiWorkforceAgentCard({ agent, onAssignTask }: AiWorkforceAgentCardProps) {
  const tc = useThemeClasses()
  const Icon = agent.icon

  function handleAssignTask() {
    onAssignTask?.(agent.id)
    Alert.alert(
      'Tarefa atribuída',
      `${agent.name} já está trabalhando na sua próxima prioridade.`,
    )
  }

  return (
    <View className={['p-5', tc.cardLg].join(' ')} style={tc.cardShadow}>
      <View className="flex-row items-start gap-4">
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${agent.accentColor}18` }}
        >
          <Icon size={26} color={agent.accentColor} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className={['text-base font-bold', tc.textPrimary].join(' ')}>{agent.name}</Text>
            <View className="rounded-full bg-emerald/10 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-emerald">Online</Text>
            </View>
          </View>
          <Text className={['mt-1 text-sm leading-5', tc.textSecondary].join(' ')}>{agent.role}</Text>
        </View>
      </View>

      <View className={['mt-4 flex-row items-center gap-2 rounded-2xl px-4 py-3', tc.surfaceMuted].join(' ')}>
        <Bot size={14} color={tc.chevron} />
        <Text className={['flex-1 text-sm', tc.textLabel].join(' ')}>{agent.history}</Text>
      </View>

      <Pressable
        onPress={handleAssignTask}
        className="mt-4 rounded-2xl bg-electricBlue py-3.5 active:opacity-90"
      >
        <Text className="text-center text-sm font-bold text-white">Atribuir Tarefa</Text>
      </Pressable>
    </View>
  )
}
