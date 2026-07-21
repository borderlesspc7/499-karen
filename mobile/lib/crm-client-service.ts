import { initialCards, initialClients, initialColumns } from '@shared/data'
import type { Client, KanbanCard } from '@shared/types'
import {
  buildLinkedCrmSnapshot,
  buildMissingClientOpportunityCards,
  linkCardsToClients,
  resolveDefaultColumns,
  type LinkedCrmSnapshot,
} from '@shared/utils/link-crm-clients'
import { moveCardBetweenColumns, normalizeColumnOrders } from './crm-move-card'
import { syncInboxFromClients } from './inbox-service'
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

async function ensureDefaultColumns(): Promise<void> {
  const crmRepository = getCrmRepository()
  const columns = await crmRepository.listColumns()

  if (columns.length > 0) {
    return
  }

  await Promise.all(initialColumns.map((column) => crmRepository.upsertColumn(column)))
}

async function syncClientOpportunities(clients: Client[], cards: KanbanCard[]): Promise<void> {
  if (clients.length === 0) {
    return
  }

  const crmRepository = getCrmRepository()
  const columns = resolveDefaultColumns(await crmRepository.listColumns())
  const linkedCards = linkCardsToClients(cards, clients)
  const persistOperations: Promise<void>[] = []

  for (const card of linkedCards) {
    const original = cards.find((item) => item.id === card.id)
    if (original && !original.clientId && card.clientId) {
      persistOperations.push(crmRepository.upsertCard(card))
    }
  }

  const missingCards = buildMissingClientOpportunityCards(clients, linkedCards, columns)
  for (const card of missingCards) {
    persistOperations.push(crmRepository.upsertCard(syncCardClientName(card, clients)))
  }

  await Promise.all(persistOperations)
}

async function maybeSyncInbox(userId: string | undefined, clients: Client[]): Promise<void> {
  if (!userId || clients.length === 0) {
    return
  }

  try {
    await syncInboxFromClients(userId, clients)
  } catch {
    // Inbox sync é best-effort; não bloqueia o CRM.
  }
}

export async function loadLinkedCrmSnapshot(userId?: string): Promise<LinkedCrmSnapshot> {
  const clientRepository = getClientRepository()
  const crmRepository = getCrmRepository()

  try {
    await ensureDefaultColumns()
  } catch {
    // Continua com colunas padrão em memória se não puder gravar no Firestore.
  }

  let clients = await clientRepository.listClients()
  let columns = await crmRepository.listColumns()
  let cards = await crmRepository.listCards()

  if (clients.length > 0) {
    try {
      await syncClientOpportunities(clients, cards)

      const refreshed = await Promise.all([
        clientRepository.listClients(),
        crmRepository.listColumns(),
        crmRepository.listCards(),
      ])

      clients = refreshed[0]
      columns = refreshed[1]
      cards = refreshed[2]
    } catch {
      // Mesmo sem gravar oportunidades, o merge em memória exibe os clientes no funil.
    }
  }

  const snapshot = buildLinkedCrmSnapshot(clients, columns, cards)

  if (userId) {
    await maybeSyncInbox(userId, snapshot.clients)
  }

  return snapshot
}

export async function seedLinkedDemoData(userId?: string): Promise<LinkedCrmSnapshot> {
  const clientRepository = getClientRepository()
  const crmRepository = getCrmRepository()

  await Promise.all(initialClients.map((client) => clientRepository.upsertClient(client)))

  const syncedCards = initialCards.map((card) => syncCardClientName(card, initialClients))

  await Promise.all([
    ...initialColumns.map((column) => crmRepository.upsertColumn(column)),
    ...syncedCards.map((card) => crmRepository.upsertCard(card)),
  ])

  return loadLinkedCrmSnapshot(userId)
}

export async function moveOpportunityToColumn(
  cardId: string,
  targetColumnId: string,
  targetIndex?: number,
): Promise<LinkedCrmSnapshot> {
  const crmRepository = getCrmRepository()
  const snapshot = await loadLinkedCrmSnapshot()

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

  await Promise.all(changedCards.map((card) => crmRepository.upsertCard(card)))

  return loadLinkedCrmSnapshot()
}
