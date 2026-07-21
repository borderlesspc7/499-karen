import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard'
import { LeadDetailModal, PipelineValueBanner } from '@/components/opportunities'
import type { KanbanCardWithClient, KanbanColumn } from '@shared/types'
import { useAuth, useGamification } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import {
  buildGrowthFlowLeads,
  buildWonLeads,
  computePipelineNegotiationValue,
  type GrowthFlowLead,
} from '@/lib/crm-lead-insights'
import {
  loadLinkedCrmSnapshot,
  moveOpportunityToColumn,
  seedLinkedDemoData,
} from '@/lib/crm-client-service'
import { moveCardBetweenColumns, normalizeColumnOrders } from '@/lib/crm-move-card'

export default function OpportunitiesScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { executeAction } = useGamification()
  const { currentUser } = useAuth()

  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [cards, setCards] = useState<KanbanCardWithClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<GrowthFlowLead | null>(null)
  const [activeDragCardId, setActiveDragCardId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const loadOpportunities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fonte de verdade: Firestore via firestore-crm-repository (não initial-crm em runtime).
      const snapshot = await loadLinkedCrmSnapshot(currentUser?.id)
      setColumns(snapshot.columns)
      setCards(snapshot.cards)
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar as oportunidades.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    void loadOpportunities()
  }, [loadOpportunities])

  async function handleSeedDemoData() {
    setIsSeeding(true)
    setError(null)

    try {
      const snapshot = await seedLinkedDemoData(currentUser?.id)
      setColumns(snapshot.columns)
      setCards(snapshot.cards)
    } catch (seedError) {
      const message =
        seedError instanceof Error
          ? seedError.message
          : 'Não foi possível importar oportunidades demo.'
      setError(message)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleMoveCard = useCallback(
    (cardId: string, targetColumnId: string, targetIndex?: number) => {
      // Optimistic update: UI move na hora; Firestore sincroniza em background.
      setCards((current) => {
        const moved = moveCardBetweenColumns(current, cardId, targetColumnId, targetIndex)
        return normalizeColumnOrders(moved, columns) as KanbanCardWithClient[]
      })

      void moveOpportunityToColumn(cardId, targetColumnId, targetIndex)
        .then((snapshot) => {
          setColumns(snapshot.columns)
          setCards(snapshot.cards)
        })
        .catch(() => {
          void loadOpportunities()
        })
    },
    [columns, loadOpportunities],
  )

  const growthFlowLeads = useMemo(() => buildGrowthFlowLeads(cards), [cards])
  const wonLeads = useMemo(() => buildWonLeads(cards), [cards])

  const pipelineValue = useMemo(
    () => computePipelineNegotiationValue(growthFlowLeads),
    [growthFlowLeads],
  )

  function handleCardPress(card: KanbanCardWithClient) {
    const lead =
      growthFlowLeads.find((item) => item.id === card.id) ??
      wonLeads.find((item) => item.id === card.id)

    if (lead) {
      setSelectedLead(lead)
    }
  }

  if (isLoading && cards.length === 0) {
    return (
      <ThemedScreen className="items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={['mt-3 text-sm', tc.textSecondary].join(' ')}>
          Carregando pipeline do Firestore...
        </Text>
      </ThemedScreen>
    )
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
          <RefreshControl refreshing={isLoading} onRefresh={() => void loadOpportunities()} />
        }
        showsVerticalScrollIndicator={false}
      >
        <DesktopContent maxWidth="7xl" className="gap-6">
          <View className="gap-2">
            <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
              Oportunidades
            </Text>
            <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
              Kanban CRM sincronizado com Firestore — arraste cards entre etapas do funil.
            </Text>
          </View>

          {growthFlowLeads.length > 0 ? (
            <PipelineValueBanner value={pipelineValue} leadCount={growthFlowLeads.length} />
          ) : null}

          {error ? (
            <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {cards.length === 0 && columns.length === 0 && !isLoading ? (
            <View className={['items-center gap-4 rounded-3xl p-8', tc.emptyState].join(' ')}>
              <Text className={['text-center text-base font-medium', tc.textPrimary].join(' ')}>
                Nenhuma oportunidade encontrada ainda
              </Text>
              <Pressable
                onPress={() => void loadOpportunities()}
                disabled={isLoading}
                className="rounded-2xl bg-electricBlue px-5 py-3 active:opacity-80"
              >
                <Text className="font-semibold text-white">
                  {isLoading ? 'Sincronizando...' : 'Sincronizar Firestore'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleSeedDemoData()}
                disabled={isSeeding}
                className={[
                  'rounded-2xl border px-5 py-3 active:opacity-70',
                  tc.isDark ? 'border-white/10' : 'border-slate-200',
                ].join(' ')}
              >
                <Text className={['font-medium', tc.textLabel].join(' ')}>
                  {isSeeding ? 'Importando...' : 'Importar dados demo'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <CrmKanbanBoard
              columns={columns}
              cards={cards}
              onCardPress={handleCardPress}
              onMoveCard={handleMoveCard}
              activeDragCardId={activeDragCardId}
              onDragStart={setActiveDragCardId}
              onDragEnd={() => setActiveDragCardId(null)}
              overColumnId={overColumnId}
              onDragOver={setOverColumnId}
            />
          )}
        </DesktopContent>
      </ScrollView>

      <LeadDetailModal
        lead={selectedLead}
        visible={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        onExecute={() => executeAction('follow-up-leads')}
      />
    </ThemedScreen>
  )
}
