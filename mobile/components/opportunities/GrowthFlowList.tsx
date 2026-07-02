import { Alert, Pressable, Text, View } from 'react-native'
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react-native'
import type { GrowthFlowLead } from '@/lib/crm-lead-insights'
import { resolveHealthColor } from '@/lib/crm-lead-insights'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type GrowthFlowListProps = {
  leads: GrowthFlowLead[]
  onLeadPress?: (lead: GrowthFlowLead) => void
  onExecuteLead?: (lead: GrowthFlowLead) => void
}

function formatRevenue(amount: number): string {
  return amount.toLocaleString('pt-BR')
}

type GrowthFlowItemProps = {
  lead: GrowthFlowLead
  rank: number
  isLast: boolean
  onPress?: () => void
  onExecute?: () => void
}

function GrowthFlowItem({ lead, rank, isLast, onPress, onExecute }: GrowthFlowItemProps) {
  const tc = useThemeClasses()
  const healthColor = resolveHealthColor(lead.healthScore)

  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View className={['h-8 w-8 items-center justify-center rounded-full', tc.rankBadge].join(' ')}>
          <Text className={['text-xs font-bold', tc.textMuted].join(' ')}>{rank}</Text>
        </View>
        {!isLast ? <View className={['mt-1 w-0.5 flex-1', tc.connectorLine].join(' ')} /> : null}
      </View>

      <View className={['flex-1', isLast ? 'pb-0' : 'pb-6'].join(' ')}>
        <Pressable
          onPress={onPress}
          className={['p-5 active:opacity-95', tc.cardLg].join(' ')}
          style={tc.cardShadow}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>{lead.clientName}</Text>
              <Text className={['mt-0.5 text-sm', tc.textSecondary].join(' ')}>{lead.title}</Text>
            </View>
            <View
              className="items-center rounded-2xl border px-2.5 py-1.5"
              style={{ borderColor: `${healthColor}33`, backgroundColor: `${healthColor}15` }}
            >
              <TrendingUp size={12} color={healthColor} />
              <Text className="mt-0.5 text-xs font-bold" style={{ color: healthColor }}>
                {lead.healthScore}%
              </Text>
            </View>
          </View>

          <View className={['mt-4 rounded-2xl px-4 py-3', tc.surfaceMuted].join(' ')}>
            <View className="flex-row items-center gap-1.5">
              <Sparkles size={13} color="#3B82F6" />
              <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
                Próxima melhor ação
              </Text>
            </View>
            <Text className={['mt-1.5 text-sm font-medium leading-5', tc.textPrimary].join(' ')}>
              {lead.nextBestAction}
            </Text>
          </View>

          <View className="mt-3 self-start rounded-full bg-emerald/10 px-3 py-1.5">
            <Text className="text-sm font-bold text-emerald">
              Impacto ao fechar: +R$ {formatRevenue(lead.dealImpact)}
            </Text>
          </View>

          <Pressable
            onPress={onExecute}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-electricBlue py-3 active:opacity-90"
          >
            <Text className="text-sm font-bold text-white">Executar Agora</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </View>
    </View>
  )
}

export function GrowthFlowList({ leads, onLeadPress, onExecuteLead }: GrowthFlowListProps) {
  const tc = useThemeClasses()

  if (leads.length === 0) {
    return (
      <View className={['rounded-3xl p-8', tc.emptyState].join(' ')}>
        <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>
          Nenhuma oportunidade ativa no momento.
        </Text>
      </View>
    )
  }

  return (
    <View>
      {leads.map((lead, index) => (
        <GrowthFlowItem
          key={lead.id}
          lead={lead}
          rank={index + 1}
          isLast={index === leads.length - 1}
          onPress={() => onLeadPress?.(lead)}
          onExecute={() => {
            onExecuteLead?.(lead)
            Alert.alert(
              'Ação em execução',
              `A IA vai ${lead.nextBestAction.toLowerCase()} para ${lead.clientName}.`,
            )
          }}
        />
      ))}
    </View>
  )
}
