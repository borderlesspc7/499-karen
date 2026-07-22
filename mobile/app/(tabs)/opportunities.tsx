import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard'
import {
  LeadDetailModal,
  OpportunityFormModal,
  PipelineValueBanner,
  parseDealValueInput,
  type OpportunityFormValues,
} from '@/components/opportunities'
import type { Client, KanbanCardWithClient, KanbanColumn } from '@shared/types'
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
  createOpportunity,
  deleteOpportunity,
  loadLinkedCrmSnapshot,
  moveOpportunityToColumn,
  updateOpportunity,
} from '@/lib/crm-client-service'
import { moveCardBetweenColumns, normalizeColumnOrders } from '@/lib/crm-move-card'

export default function OpportunitiesScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { executeAction } = useGamification()
  const { currentUser } = useAuth()

  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [cards, setCards] = useState<KanbanCardWithClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<GrowthFlowLead | null>(null)
  const [activeDragCardId, setActiveDragCardId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingCard, setEditingCard] = useState<KanbanCardWithClient | null>(null)

  const loadOpportunities = useCallback(async () => {
    if (!currentUser?.id) {
      setColumns([])
      setCards([])
      setClients([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const snapshot = await loadLinkedCrmSnapshot(currentUser.id)
      setColumns(snapshot.columns)
      setCards(snapshot.cards)
      setClients(snapshot.clients)
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

  const handleMoveCard = useCallback(
    (cardId: string, targetColumnId: string, targetIndex?: number) => {
      if (!currentUser?.id) {
        return
      }

      const userId = currentUser.id

      setCards((current) => {
        const moved = moveCardBetweenColumns(current, cardId, targetColumnId, targetIndex)
        return normalizeColumnOrders(moved, columns) as KanbanCardWithClient[]
      })

      void moveOpportunityToColumn(userId, cardId, targetColumnId, targetIndex)
        .then((snapshot) => {
          setColumns(snapshot.columns)
          setCards(snapshot.cards)
          setClients(snapshot.clients)
        })
        .catch(() => {
          void loadOpportunities()
        })
    },
    [columns, currentUser?.id, loadOpportunities],
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

  function openCreateForm() {
    setEditingCard(null)
    setIsFormVisible(true)
  }

  function openEditFromLead(lead: GrowthFlowLead) {
    setSelectedLead(null)
    setEditingCard(lead)
    setIsFormVisible(true)
  }

  async function handleSubmitOpportunity(values: OpportunityFormValues) {
    if (!currentUser?.id) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const dealValue = parseDealValueInput(values.dealValue)
      const snapshot = editingCard
        ? await updateOpportunity(currentUser.id, editingCard.id, {
            title: values.title,
            description: values.description,
            category: values.category,
            priority: values.priority,
            clientId: values.clientId ?? undefined,
            clientName: values.clientName,
            dueDate: values.dueDate,
            columnId: values.columnId,
            dealValue,
          })
        : await createOpportunity({
            userId: currentUser.id,
            title: values.title,
            description: values.description,
            category: values.category,
            priority: values.priority,
            clientId: values.clientId ?? undefined,
            clientName: values.clientName,
            dueDate: values.dueDate,
            columnId: values.columnId,
            dealValue,
            attribution: { source: 'manual' },
          })

      setColumns(snapshot.columns)
      setCards(snapshot.cards)
      setClients(snapshot.clients)
      setIsFormVisible(false)
      setEditingCard(null)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível salvar a oportunidade.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleDeleteLead(lead: GrowthFlowLead) {
    if (!currentUser?.id) {
      return
    }

    Alert.alert('Excluir oportunidade', `Remover "${lead.title}" do funil?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const snapshot = await deleteOpportunity(currentUser.id, lead.id)
              setColumns(snapshot.columns)
              setCards(snapshot.cards)
              setClients(snapshot.clients)
              setSelectedLead(null)
            } catch (deleteError) {
              setError(
                deleteError instanceof Error
                  ? deleteError.message
                  : 'Não foi possível excluir a oportunidade.',
              )
            }
          })()
        },
      },
    ])
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
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-2">
              <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
                Oportunidades
              </Text>
              <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
                Funil CRM no Firestore. Cadastre deals agora; leads de Meta Ads entram na mesma
                estrutura depois.
              </Text>
            </View>
            <Pressable
              onPress={openCreateForm}
              className="rounded-2xl bg-electricBlue px-4 py-3 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-white">Nova</Text>
            </Pressable>
          </View>

          {growthFlowLeads.length > 0 ? (
            <PipelineValueBanner value={pipelineValue} leadCount={growthFlowLeads.length} />
          ) : null}

          {error ? (
            <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {cards.length === 0 && !isLoading ? (
            <View className={['items-center gap-4 rounded-3xl p-8', tc.emptyState].join(' ')}>
              <Text className={['text-center text-base font-medium', tc.textPrimary].join(' ')}>
                Nenhuma oportunidade no pipeline
              </Text>
              <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>
                Crie a primeira oportunidade ou cadastre um cliente para começar.
              </Text>
              <Pressable
                onPress={openCreateForm}
                className="rounded-2xl bg-electricBlue px-5 py-3 active:opacity-80"
              >
                <Text className="font-semibold text-white">Criar oportunidade</Text>
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
        onEdit={selectedLead ? () => openEditFromLead(selectedLead) : undefined}
        onDelete={selectedLead ? () => handleDeleteLead(selectedLead) : undefined}
      />

      <OpportunityFormModal
        visible={isFormVisible}
        columns={columns}
        clients={clients}
        initialCard={editingCard}
        isSaving={isSaving}
        onClose={() => {
          setIsFormVisible(false)
          setEditingCard(null)
        }}
        onSubmit={(values) => void handleSubmitOpportunity(values)}
      />
    </ThemedScreen>
  )
}
