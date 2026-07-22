import type {
  Client,
  CreateClientInput,
  CreateOpportunityInput,
  KanbanCard,
} from '@shared/types'
import {
  buildLinkedCrmSnapshot,
  buildMissingClientOpportunityCards,
  linkCardsToClients,
  resolveDefaultColumns,
  type LinkedCrmSnapshot,
} from '@shared/utils/link-crm-clients'
import { buildDefaultKanbanColumns } from '@shared/data/default-kanban-columns'
import { generateId } from '@shared/utils/generate-id'
import { moveCardBetweenColumns, normalizeColumnOrders } from './crm-move-card'
import { getClientRepository, getCrmRepository } from './repositories'

function formatTodayPtBr(): string {
  return new Date().toLocaleDateString('pt-BR')
}

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

export async function createClient(input: CreateClientInput): Promise<LinkedCrmSnapshot> {
  const now = new Date().toISOString()
  const attribution = input.attribution ?? { source: 'manual' as const }

  const client: Client = {
    id: generateId(),
    userId: input.userId,
    name: input.name.trim(),
    company: input.company.trim() || '—',
    email: input.email.trim() || '—',
    phone: input.phone?.trim() || undefined,
    status: input.status ?? 'prospecto',
    lastContact: formatTodayPtBr(),
    notes: input.notes?.trim() || undefined,
    source: attribution.source,
    campaignId: attribution.campaignId,
    externalLeadId: attribution.externalLeadId,
    createdAt: now,
    updatedAt: now,
  }

  await getClientRepository().upsertClient(client)
  return loadLinkedCrmSnapshot(input.userId)
}

export async function updateClient(
  userId: string,
  clientId: string,
  patch: Partial<
    Pick<Client, 'name' | 'company' | 'email' | 'phone' | 'status' | 'notes' | 'lastContact'>
  >,
): Promise<LinkedCrmSnapshot> {
  const repository = getClientRepository()
  const existing = await repository.getClientById(userId, clientId)

  if (!existing) {
    throw new Error('Cliente não encontrado.')
  }

  const updated: Client = {
    ...existing,
    ...patch,
    name: patch.name?.trim() ?? existing.name,
    company: patch.company?.trim() ?? existing.company,
    email: patch.email?.trim() ?? existing.email,
    phone: patch.phone !== undefined ? patch.phone.trim() || undefined : existing.phone,
    notes: patch.notes !== undefined ? patch.notes.trim() || undefined : existing.notes,
    updatedAt: new Date().toISOString(),
  }

  await repository.upsertClient(updated)
  return loadLinkedCrmSnapshot(userId)
}

export async function deleteClient(userId: string, clientId: string): Promise<LinkedCrmSnapshot> {
  const clientRepository = getClientRepository()
  const crmRepository = getCrmRepository()
  const cards = await crmRepository.listCards(userId)

  await Promise.all([
    clientRepository.deleteClient(userId, clientId),
    ...cards
      .filter((card) => card.clientId === clientId || card.id === `client-opp-${clientId}`)
      .map((card) => crmRepository.deleteCard(userId, card.id)),
  ])

  return loadLinkedCrmSnapshot(userId)
}

export async function createOpportunity(
  input: CreateOpportunityInput,
): Promise<LinkedCrmSnapshot> {
  await ensureDefaultColumns(input.userId)

  const now = new Date().toISOString()
  const attribution = input.attribution ?? { source: 'manual' as const }
  const cards = await getCrmRepository().listCards(input.userId)
  const columnCards = cards.filter((card) => card.columnId === input.columnId)

  const card: KanbanCard = {
    id: generateId(),
    userId: input.userId,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    category: input.category ?? 'vendas',
    priority: input.priority ?? 'media',
    clientName: input.clientName?.trim() || '—',
    dueDate: input.dueDate?.trim() || formatTodayPtBr(),
    columnId: input.columnId,
    order: columnCards.length,
    dealValue: Math.max(0, input.dealValue ?? 0),
    source: attribution.source,
    createdAt: now,
    updatedAt: now,
    ...(input.clientId ? { clientId: input.clientId } : {}),
    ...(attribution.campaignId ? { campaignId: attribution.campaignId } : {}),
    ...(attribution.externalLeadId ? { externalLeadId: attribution.externalLeadId } : {}),
  }

  await getCrmRepository().upsertCard(card)
  return loadLinkedCrmSnapshot(input.userId)
}

export async function updateOpportunity(
  userId: string,
  cardId: string,
  patch: Partial<
    Pick<
      KanbanCard,
      | 'title'
      | 'description'
      | 'category'
      | 'priority'
      | 'clientId'
      | 'clientName'
      | 'dueDate'
      | 'columnId'
      | 'dealValue'
    >
  >,
): Promise<LinkedCrmSnapshot> {
  const repository = getCrmRepository()
  const existing = await repository.getCardById(userId, cardId)

  if (!existing) {
    throw new Error('Oportunidade não encontrada.')
  }

  const updated: KanbanCard = {
    ...existing,
    title: patch.title?.trim() ?? existing.title,
    description:
      patch.description !== undefined ? patch.description.trim() : existing.description,
    category: patch.category ?? existing.category,
    priority: patch.priority ?? existing.priority,
    clientName: patch.clientName?.trim() ?? existing.clientName,
    dueDate: patch.dueDate?.trim() ?? existing.dueDate,
    columnId: patch.columnId ?? existing.columnId,
    dealValue:
      patch.dealValue !== undefined ? Math.max(0, patch.dealValue) : existing.dealValue,
    updatedAt: new Date().toISOString(),
  }

  if (patch.clientId === null || patch.clientId === '') {
    delete updated.clientId
  } else if (patch.clientId !== undefined) {
    updated.clientId = patch.clientId
  }

  await repository.upsertCard(updated)
  return loadLinkedCrmSnapshot(userId)
}

export async function deleteOpportunity(
  userId: string,
  cardId: string,
): Promise<LinkedCrmSnapshot> {
  await getCrmRepository().deleteCard(userId, cardId)
  return loadLinkedCrmSnapshot(userId)
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

  const now = new Date().toISOString()
  await Promise.all(
    changedCards.map((card) =>
      crmRepository.upsertCard({ ...card, userId, updatedAt: now }),
    ),
  )

  return loadLinkedCrmSnapshot(userId)
}
