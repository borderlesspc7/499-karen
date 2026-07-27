import { useCallback, useMemo, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import type { KanbanCardWithClient, KanbanColumn } from '@shared/types'
import { dedupeCardsById } from '@shared/utils/link-crm-clients'
import { CrmOpportunityCard } from './CrmOpportunityCard'

type CrmKanbanMobileProps = {
  columns: KanbanColumn[]
  cards: KanbanCardWithClient[]
  onCardPress: (card: KanbanCardWithClient) => void
  onMoveCard: (cardId: string, targetColumnId: string, targetIndex?: number) => void
}

type ColumnLayout = {
  y: number
  height: number
}

type ColumnGroup = {
  column: KanbanColumn
  cards: KanbanCardWithClient[]
}

const LONG_PRESS_DURATION_MS = 280
const SPRING_CONFIG = { damping: 22, stiffness: 240, mass: 0.8 }

function findColumnAtY(
  layouts: Map<string, ColumnLayout>,
  y: number,
  columnIds: string[],
): string | null {
  for (const columnId of columnIds) {
    const layout = layouts.get(columnId)
    if (layout && y >= layout.y && y <= layout.y + layout.height) {
      return columnId
    }
  }

  return null
}

function MobileDraggableCard({
  card,
  onPress,
  onMoveCard,
  getColumnLayouts,
  columnIds,
  draggingCardId,
  onDragStart,
  onDragEnd,
  onHoverColumn,
  onMeasureColumns,
}: {
  card: KanbanCardWithClient
  onPress: () => void
  onMoveCard: (cardId: string, targetColumnId: string) => void
  getColumnLayouts: () => Map<string, ColumnLayout>
  columnIds: string[]
  draggingCardId: string | null
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  onHoverColumn: (columnId: string | null) => void
  onMeasureColumns: () => void
}) {
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const isDragging = useSharedValue(false)
  const lastAbsoluteY = useSharedValue(0)
  const lastHoverColumnRef = useRef<string | null>(null)
  const isDraggingThisCard = draggingCardId === card.id

  const resolveHoverColumn = useCallback(
    (absoluteY: number) => {
      const targetColumnId = findColumnAtY(getColumnLayouts(), absoluteY, columnIds)

      if (targetColumnId === lastHoverColumnRef.current) {
        return
      }

      lastHoverColumnRef.current = targetColumnId
      onHoverColumn(targetColumnId)

      if (targetColumnId) {
        onMeasureColumns()
      }
    },
    [columnIds, getColumnLayouts, onHoverColumn, onMeasureColumns],
  )

  const finishDrag = useCallback(
    (absoluteY: number) => {
      const targetColumnId = findColumnAtY(getColumnLayouts(), absoluteY, columnIds)

      if (targetColumnId && targetColumnId !== card.columnId) {
        onMoveCard(card.id, targetColumnId)
      }

      onHoverColumn(null)
      lastHoverColumnRef.current = null
      isDragging.value = false

      translateX.value = withSpring(0, SPRING_CONFIG)
      translateY.value = withSpring(0, SPRING_CONFIG, (finished) => {
        if (finished) {
          runOnJS(onDragEnd)()
        }
      })
    },
    [
      card.columnId,
      card.id,
      columnIds,
      getColumnLayouts,
      isDragging,
      onDragEnd,
      onHoverColumn,
      onMoveCard,
      translateX,
      translateY,
    ],
  )

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DURATION_MS)
    .onStart(() => {
      isDragging.value = true
      runOnJS(onMeasureColumns)()
      runOnJS(onDragStart)(card.id)
    })
    .onUpdate((event) => {
      translateX.value = event.translationX
      translateY.value = event.translationY
      lastAbsoluteY.value = event.absoluteY
      runOnJS(resolveHoverColumn)(event.absoluteY)
    })
    .onEnd(() => {
      if (!isDragging.value) {
        return
      }

      runOnJS(finishDrag)(lastAbsoluteY.value)
    })
    .onFinalize(() => {
      if (isDragging.value) {
        isDragging.value = false
      }
    })

  const animatedStyle = useAnimatedStyle(() => {
    if (!isDragging.value && !isDraggingThisCard) {
      return {}
    }

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: isDragging.value ? 1.04 : 1 },
      ],
      zIndex: isDragging.value || isDraggingThisCard ? 100 : 1,
      elevation: isDragging.value || isDraggingThisCard ? 14 : 0,
    }
  })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        <CrmOpportunityCard
          card={card}
          onPress={isDraggingThisCard ? undefined : onPress}
          isDragging={isDraggingThisCard}
          isLifted={isDraggingThisCard}
        />
      </Animated.View>
    </GestureDetector>
  )
}

export function CrmKanbanMobile({
  columns,
  cards,
  onCardPress,
  onMoveCard,
}: CrmKanbanMobileProps) {
  const columnLayoutsRef = useRef(new Map<string, ColumnLayout>())
  const columnRefs = useRef(new Map<string, View>())
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    'col-leads': true,
    'col-contato': true,
  })
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
  const [hoverColumnId, setHoverColumnId] = useState<string | null>(null)

  const groupedCards = useMemo<ColumnGroup[]>(() => {
    const uniqueCards = dedupeCardsById(cards)

    return columns.map((column) => ({
      column,
      cards: uniqueCards
        .filter((card) => card.columnId === column.id)
        .sort((left, right) => left.order - right.order),
    }))
  }, [columns, cards])

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])

  const getColumnLayouts = useCallback(() => columnLayoutsRef.current, [])

  const updateSingleColumnLayout = useCallback((columnId: string) => {
    const node = columnRefs.current.get(columnId)
    if (!node) {
      return
    }

    node.measureInWindow((_x, y, _width, height) => {
      const nextLayouts = new Map(columnLayoutsRef.current)
      nextLayouts.set(columnId, { y, height })
      columnLayoutsRef.current = nextLayouts
    })
  }, [])

  const measureColumns = useCallback(() => {
    for (const columnId of columnIds) {
      updateSingleColumnLayout(columnId)
    }
  }, [columnIds, updateSingleColumnLayout])

  const handleDragStart = useCallback(
    (cardId: string) => {
      setDraggingCardId(cardId)
      setExpandedColumns(
        columns.reduce<Record<string, boolean>>((accumulator, column) => {
          accumulator[column.id] = true
          return accumulator
        }, {}),
      )

      requestAnimationFrame(() => {
        measureColumns()
      })
    },
    [columns, measureColumns],
  )

  const handleDragEnd = useCallback(() => {
    setDraggingCardId(null)
    setHoverColumnId(null)
  }, [])

  function toggleColumn(columnId: string) {
    if (draggingCardId) {
      return
    }

    setExpandedColumns((current) => ({
      ...current,
      [columnId]: !current[columnId],
    }))
  }

  return (
    <View className="gap-4">
      {draggingCardId ? (
        <View className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
          <Text className="text-sm font-medium text-violet-700">
            Segure o card, depois arraste para cima ou para baixo entre as etapas
          </Text>
        </View>
      ) : null}

      {groupedCards.map(({ column, cards: columnCards }) => {
        const isExpanded = draggingCardId ? true : (expandedColumns[column.id] ?? false)
        const isHovered = hoverColumnId === column.id

        return (
          <View
            key={column.id}
            ref={(node) => {
              if (node) {
                columnRefs.current.set(column.id, node)
              } else {
                columnRefs.current.delete(column.id)
              }
            }}
            onLayout={() => updateSingleColumnLayout(column.id)}
            className={[
              'overflow-hidden rounded-3xl border bg-white shadow-sm',
              isHovered ? 'border-violet-400 bg-violet-50/20' : 'border-slate-200',
            ].join(' ')}
          >
            <Pressable
              onPress={() => toggleColumn(column.id)}
              disabled={Boolean(draggingCardId)}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                <Text className="text-base font-semibold text-slate-900">{column.title}</Text>
                <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
                  <Text className="text-xs font-medium text-slate-600">{columnCards.length}</Text>
                </View>
              </View>
              {isExpanded ? (
                <ChevronUp size={18} color="#64748b" />
              ) : (
                <ChevronDown size={18} color="#64748b" />
              )}
            </Pressable>

            {isExpanded ? (
              <View style={styles.columnCards}>
                {columnCards.length === 0 ? (
                  <Text className="py-4 text-center text-sm text-slate-400">
                    {isHovered ? 'Solte aqui' : 'Nenhuma oportunidade nesta etapa.'}
                  </Text>
                ) : (
                  <FlatList
                    data={columnCards}
                    keyExtractor={(card) => card.id}
                    scrollEnabled={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={5}
                    renderItem={({ item: card }) => (
                      <MobileDraggableCard
                        card={card}
                        onPress={() => onCardPress(card)}
                        onMoveCard={onMoveCard}
                        getColumnLayouts={getColumnLayouts}
                        columnIds={columnIds}
                        draggingCardId={draggingCardId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onHoverColumn={setHoverColumnId}
                        onMeasureColumns={measureColumns}
                      />
                    )}
                  />
                )}
              </View>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  columnCards: {
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
  },
  cardWrapper: {
    marginBottom: 2,
  },
})
