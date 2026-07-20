import { memo, type ReactNode } from 'react'
import type { KanbanCardWithClient, KanbanColumn } from '@shared/types'
import { Text, View } from 'react-native'
import { CrmOpportunityCard } from './CrmOpportunityCard'

export type CrmColumnGroup = {
  column: KanbanColumn
  cards: KanbanCardWithClient[]
}

type CrmColumnProps = {
  group: CrmColumnGroup
  onCardPress: (card: KanbanCardWithClient) => void
  activeDragCardId: string | null
  isOver: boolean
  /** Render custom card slot (ex.: wrappers de drag no desktop/mobile). */
  renderCard?: (card: KanbanCardWithClient) => ReactNode
  minHeightClassName?: string
}

function CrmColumnComponent({
  group,
  onCardPress,
  activeDragCardId,
  isOver,
  renderCard,
  minHeightClassName = 'min-h-[420px]',
}: CrmColumnProps) {
  return (
    <View
      className={[
        'w-80 shrink-0 overflow-hidden rounded-3xl border bg-white shadow-sm',
        isOver ? 'border-violet-400 bg-violet-50/40' : 'border-slate-200',
      ].join(' ')}
    >
      <View className="flex-row items-center gap-3 border-b border-slate-100 px-4 py-4">
        <View className="h-2.5 w-2.5 rounded-full bg-violet-500" />
        <Text className="text-base font-semibold text-slate-900">{group.column.title}</Text>
        <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
          <Text className="text-xs font-medium text-slate-600">{group.cards.length}</Text>
        </View>
      </View>

      <View className={['gap-3 p-4', minHeightClassName].join(' ')}>
        {group.cards.length === 0 ? (
          <Text className="py-8 text-center text-sm text-slate-400">
            {isOver ? 'Solte aqui' : 'Nenhuma oportunidade nesta etapa.'}
          </Text>
        ) : (
          group.cards.map((card) =>
            renderCard ? (
              <View key={card.id}>{renderCard(card)}</View>
            ) : (
              <CrmOpportunityCard
                key={card.id}
                card={card}
                onPress={() => onCardPress(card)}
                isDragging={activeDragCardId === card.id}
              />
            ),
          )
        )}
      </View>
    </View>
  )
}

export const CrmColumn = memo(CrmColumnComponent)
