import type { Client, KanbanCard } from '@shared/types'
import {
  buildLinkedCrmSnapshot,
  buildMissingClientOpportunityCards,
  linkCardsToClients,
  resolveDefaultColumns,
  type LinkedCrmSnapshot,
} from '@shared/utils/link-crm-clients'
import { buildDefaultKanbanColumns } from '@shared/data/default-kanban-columns'
import { moveCardBetweenColumns, normalizeColumnOrders } from './crm-move-card'
import { getClientRepository, getCrmRepository } from './repositories'

function syncCardClientName(card: KanbanCard, clients: Client[]): KanbanCard {
  if (!card.clientId) {
    return card
  }

  const client = clients.find((item) => item.id === card.clientId)
  if (!client) {
    return card
  }

  return {
    ...card,
    clientName: client.name,
  }
}

async function ensureDefaultColumns(userId: string): Promise<void> {
  const crmRepository = getCrmRepository()
  const columns = await crmRepository.listColumns(userId)

  if (columns.length > 0) {
    return
  }

  const defaults = buildDefaultKanbanColumns(userId)
  await Promise.all(defaults.map((column) => crmRepository.upsertColumn(column)))
}

async function syncClientOpportunities(
  userId: string,
  clients: Client[],
  cards: KanbanCard[],
): Promise<void> {
  if (clients.length === 0) {
    return
  }

  const crmRepository = getCrmRepository()
  const columns = resolveDefaultColumns(await crmRepository.listColumns(userId), userId)
  const linkedCards = linkCardsToClients(cards, clients)
  const persistOperations: Promise<void>[] = []

  for (const card of linkedCards) {
    const original = cards.find((item) => item.id === card.id)
    if (original && !original.clientId && card.clientId) {
      persistOperations.push(crmRepository.upsertCard({ ...card, userId }))
    }
  }

  const missingCards = buildMissingClientOpportunityCards(clients, linkedCards, columns)
  for (const card of missingCards) {
    persistOperations.push(
      crmRepository.upsertCard(syncCardClientName({ ...card, userId }, clients)),
    )
  }

  await Promise.all(persistOperations)
}

export async function loadLinkedCrmSnapshot(userId: string): Promise<LinkedCrmSnapshot> {
  const clientRepository = getClientRepository()
  const crmRepository = getCrmRepository()

  try {
    await ensureDefaultColumns(userId)
  } catch {
    // Continua com colunas padrão em memória se não puder gravar no Firestore.
  }

  let clients = await clientRepository.listByUser(userId)
  let columns = await crmRepository.listColumns(userId)
  let cards = await crmRepository.listCards(userId)

  if (clients.length > 0) {
    try {
      await syncClientOpportunities(userId, clients, cards)

      const refreshed = await Promise.all([
        clientRepository.listByUser(userId),
        crmRepository.listColumns(userId),
        crmRepository.listCards(userId),
      ])

      clients = refreshed[0]
      columns = refreshed[1]
      cards = refreshed[2]
    } catch {
      // Mesmo sem gravar oportunidades, o merge em memória exibe os clientes no funil.
    }
  }

  return buildLinkedCrmSnapshot(clients, resolveDefaultColumns(columns, userId), cards)
}

export async function moveOpportunityToColumn(
  userId: string,
  cardId: string,
  targetColumnId: string,
  targetIndex?: number,
): Promise<LinkedCrmSnapshot> {
  const crmRepository = getCrmRepository()
  const snapshot = await loadLinkedCrmSnapshot(userId)

  const movedCards = moveCardBetweenColumns(
    snapshot.cards,
    cardId,
    targetColumnId,
    targetIndex,
  )
  const normalizedCards = normalizeColumnOrders(movedCards, snapshot.columns)
  const changedCards = normalizedCards.filter((card) => {
    const previous = snapshot.cards.find((item) => item.id === card.id)
    if (!previous) {
      return true
    }

    return previous.columnId !== card.columnId || previous.order !== card.order
  })

  await Promise.all(
    changedCards.map((card) => crmRepository.upsertCard({ ...card, userId })),
  )

  return loadLinkedCrmSnapshot(userId)
}
