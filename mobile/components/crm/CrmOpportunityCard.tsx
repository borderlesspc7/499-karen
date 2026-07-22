import { memo } from 'react'
import type { KanbanCardWithClient } from '@shared/types'
import { categoryLabels, priorityLabels } from '@shared/data'
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'

type CrmOpportunityCardProps = {
  card: KanbanCardWithClient
  onPress?: () => void
  onLongPress?: () => void
  isDragging?: boolean
  isLifted?: boolean
  className?: string
}

function resolveCardVisualStyle(isDragging: boolean, isLifted: boolean): ViewStyle | undefined {
  if (isLifted) {
    return cardVisualStyles.lifted
  }

  if (isDragging) {
    return cardVisualStyles.dragging
  }

  return undefined
}

function CrmOpportunityCardComponent({
  card,
  onPress,
  onLongPress,
  isDragging = false,
  isLifted = false,
  className = '',
}: CrmOpportunityCardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={onLongPress ? 450 : undefined}
      disabled={isDragging && !isLifted}
      className={[
        'rounded-2xl border border-slate-200 bg-slate-50 p-4 active:border-violet-200',
        className,
      ].join(' ')}
      style={resolveCardVisualStyle(isDragging, isLifted)}
    >
      <View className="flex-row flex-wrap gap-2">
        <View className="rounded-full bg-violet-100 px-2.5 py-0.5">
          <Text className="text-xs font-medium text-violet-700">{categoryLabels[card.category]}</Text>
        </View>
        <Text className="text-xs font-medium text-amber-700">{priorityLabels[card.priority]}</Text>
        {card.dealValue > 0 ? (
          <View className="rounded-full bg-emerald-100 px-2.5 py-0.5">
            <Text className="text-xs font-medium text-emerald-700">
              R$ {card.dealValue.toLocaleString('pt-BR')}
            </Text>
          </View>
        ) : null}
        {card.source !== 'manual' ? (
          <View className="rounded-full bg-sky-100 px-2.5 py-0.5">
            <Text className="text-xs font-medium text-sky-700">
              {card.source === 'meta_ads' ? 'Meta Ads' : 'Campanha'}
            </Text>
          </View>
        ) : null}
        {card.isClientDerived ? (
          <View className="rounded-full bg-slate-200 px-2.5 py-0.5">
            <Text className="text-xs font-medium text-slate-700">Do cadastro</Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-2 font-semibold text-slate-900">{card.title}</Text>
      <Text className="mt-1 text-sm text-slate-500" numberOfLines={2}>
        {card.description}
      </Text>
      <Text className="mt-3 text-xs text-slate-500">{card.displayClientName}</Text>
    </Pressable>
  )
}

/** Card do Kanban — memoizado para evitar re-render durante drag & drop. */
export const CrmOpportunityCard = memo(CrmOpportunityCardComponent)

/** Alias semântico pedido na refatoração estrutural. */
export const CrmCard = CrmOpportunityCard

const cardVisualStyles = StyleSheet.create({
  lifted: {
    backgroundColor: '#ffffff',
    borderColor: '#c4b5fd',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dragging: {
    backgroundColor: 'rgba(237, 233, 254, 0.4)',
    borderColor: '#ddd6fe',
    borderStyle: 'dashed',
    opacity: 0.4,
  },
})
