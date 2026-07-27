import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import type { Client, KanbanCardWithClient, KanbanColumn } from '@shared/types'
import { useAuth, useGamification } from '@shared/contexts'
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
import {
  parseDealValueInput,
  type OpportunityFormValues,
} from '@/components/opportunities/OpportunityFormModal'

export function useOpportunitiesScreen() {
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

  const applySnapshot = useCallback(
    (snapshot: Awaited<ReturnType<typeof loadLinkedCrmSnapshot>>) => {
      setColumns(snapshot.columns)
      setCards(snapshot.cards)
      setClients(snapshot.clients)
    },
    [],
  )

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
      applySnapshot(await loadLinkedCrmSnapshot(currentUser.id))
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar as oportunidades.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [applySnapshot, currentUser?.id])

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
        .then(applySnapshot)
        .catch(() => {
          void loadOpportunities()
        })
    },
    [applySnapshot, columns, currentUser?.id, loadOpportunities],
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

      applySnapshot(snapshot)
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
              applySnapshot(await deleteOpportunity(currentUser.id, lead.id))
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

  return {
    columns,
    cards,
    clients,
    isLoading,
    isSaving,
    error,
    selectedLead,
    setSelectedLead,
    activeDragCardId,
    setActiveDragCardId,
    overColumnId,
    setOverColumnId,
    isFormVisible,
    setIsFormVisible,
    editingCard,
    setEditingCard,
    growthFlowLeads,
    pipelineValue,
    executeAction,
    loadOpportunities,
    handleMoveCard,
    handleCardPress,
    openCreateForm,
    openEditFromLead,
    handleSubmitOpportunity,
    handleDeleteLead,
  }
}
