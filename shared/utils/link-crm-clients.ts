import { buildDefaultKanbanColumns } from '../data/default-kanban-columns'
import type { Client } from '../types/client'
import type { KanbanCard, KanbanColumn } from '../types/crm'

export type KanbanCardWithClient = KanbanCard & {
  client: Client | null
  columnTitle: string | null
  displayClientName: string
  isClientDerived?: boolean
}

export type ClientWithPipeline = Client & {
  opportunities: KanbanCard[]
  opportunityCount: number
  pipelineStage: string | null
  primaryOpportunity: KanbanCard | null
}

export type LinkedCrmSnapshot = {
  clients: ClientWithPipeline[]
  columns: KanbanColumn[]
  cards: KanbanCardWithClient[]
}

function buildClientMap(clients: Client[]): Map<string, Client> {
  return new Map(clients.map((client) => [client.id, client]))
}

function resolveClientIdFromCard(card: KanbanCard): string | null {
  if (card.clientId) {
    return card.clientId
  }

  if (card.id.startsWith('client-opp-')) {
    return card.id.slice('client-opp-'.length)
  }

  return null
}

export function dedupeCardsById<T extends KanbanCard>(cards: T[]): T[] {
  const byId = new Map<string, T>()

  for (const card of cards) {
    const existing = byId.get(card.id)
    if (!existing || (!existing.clientId && card.clientId)) {
      byId.set(card.id, card)
    }
  }

  return [...byId.values()]
}

function buildColumnMaps(columns: KanbanColumn[]) {
  return {
    orderById: new Map(columns.map((column) => [column.id, column.order])),
    titleById: new Map(columns.map((column) => [column.id, column.title])),
  }
}

export function resolveDefaultColumns(
  columns: KanbanColumn[],
  userId = columns[0]?.userId ?? '',
): KanbanColumn[] {
  if (columns.length > 0) {
    return [...columns].sort((left, right) => left.order - right.order)
  }

  return buildDefaultKanbanColumns(userId)
}

export function linkCardsToClients(cards: KanbanCard[], clients: Client[]): KanbanCard[] {
  const clientsByName = new Map(
    clients.map((client) => [client.name.trim().toLowerCase(), client]),
  )

  return cards.map((card) => {
    if (card.clientId) {
      return card
    }

    const matchedClient = clientsByName.get(card.clientName.trim().toLowerCase())
    if (!matchedClient) {
      return card
    }

    return {
      ...card,
      clientId: matchedClient.id,
      clientName: matchedClient.name,
    }
  })
}

function resolveColumnId(columns: KanbanColumn[], ...preferredTitles: string[]): string {
  const userId = columns[0]?.userId ?? ''
  const sortedColumns = resolveDefaultColumns(columns, userId)
  const normalizedTitles = preferredTitles.map((title) => title.toLowerCase())

  for (const title of normalizedTitles) {
    const match = sortedColumns.find((column) => column.title.toLowerCase() === title)
    if (match) {
      return match.id
    }
  }

  return sortedColumns[0]?.id ?? 'col-leads'
}

function mapClientStatusToColumnId(client: Client, columns: KanbanColumn[]): string {
  switch (client.status) {
    case 'prospecto':
      return resolveColumnId(columns, 'leads')
    case 'ativo':
      return resolveColumnId(columns, 'contato', 'negociação', 'negociacao')
    case 'inativo':
      return resolveColumnId(columns, 'leads')
    default:
      return resolveColumnId(columns, 'leads')
  }
}

export function buildClientOpportunityCard(
  client: Client,
  columns: KanbanColumn[],
  order: number,
): KanbanCard {
  const columnId = mapClientStatusToColumnId(client, columns)

  const titleByStatus: Record<Client['status'], string> = {
    prospecto: `Qualificar ${client.name}`,
    ativo: `Acompanhar ${client.name}`,
    inativo: `Reativar ${client.name}`,
  }

  const categoryByStatus: Record<Client['status'], KanbanCard['category']> = {
    prospecto: 'vendas',
    ativo: 'follow-up',
    inativo: 'marketing',
  }

  return {
    id: `client-opp-${client.id}`,
    userId: client.userId,
    title: titleByStatus[client.status],
    description: `${client.company} — sincronizado automaticamente do cadastro de clientes.`,
    category: categoryByStatus[client.status],
    priority: client.status === 'prospecto' ? 'media' : 'baixa',
    clientId: client.id,
    clientName: client.name,
    dueDate: client.lastContact,
    columnId,
    order,
    dealValue: 0,
    source: client.source,
    campaignId: client.campaignId,
    externalLeadId: client.externalLeadId,
    createdAt: client.createdAt,
    updatedAt: new Date().toISOString(),
  }
}

export function buildMissingClientOpportunityCards(
  clients: Client[],
  cards: KanbanCard[],
  columns: KanbanColumn[],
): KanbanCard[] {
  const linkedClientIds = new Set(
    cards.flatMap((card) => {
      const clientId = resolveClientIdFromCard(card)
      return clientId ? [clientId] : []
    }),
  )

  const missingClients = clients.filter((client) => !linkedClientIds.has(client.id))

  return missingClients.map((client, index) =>
    buildClientOpportunityCard(client, columns, cards.length + index),
  )
}

export function mergeClientOpportunities(
  clients: Client[],
  columns: KanbanColumn[],
  cards: KanbanCard[],
): KanbanCard[] {
  const resolvedColumns = resolveDefaultColumns(columns)
  const linkedCards = linkCardsToClients(cards, clients)
  const missingCards = buildMissingClientOpportunityCards(clients, linkedCards, resolvedColumns)

  return dedupeCardsById([...linkedCards, ...missingCards])
}

export function enrichCardsWithClients(
  cards: KanbanCard[],
  clients: Client[],
  columns: KanbanColumn[],
): KanbanCardWithClient[] {
  const clientMap = buildClientMap(clients)
  const { titleById } = buildColumnMaps(resolveDefaultColumns(columns))

  return cards.map((card) => {
    const client = card.clientId ? (clientMap.get(card.clientId) ?? null) : null
    const isClientDerived = card.id.startsWith('client-opp-')

    return {
      ...card,
      client,
      columnTitle: titleById.get(card.columnId) ?? null,
      displayClientName: client?.name ?? card.clientName,
      isClientDerived,
    }
  })
}

export function enrichClientsWithPipeline(
  clients: Client[],
  cards: KanbanCard[],
  columns: KanbanColumn[],
): ClientWithPipeline[] {
  const { orderById, titleById } = buildColumnMaps(resolveDefaultColumns(columns))

  return clients.map((client) => {
    const opportunities = cards.filter((card) => card.clientId === client.id)
    const sortedByStage = [...opportunities].sort(
      (left, right) =>
        (orderById.get(right.columnId) ?? -1) - (orderById.get(left.columnId) ?? -1),
    )
    const primaryOpportunity = sortedByStage[0] ?? null

    return {
      ...client,
      opportunities,
      opportunityCount: opportunities.length,
      pipelineStage: primaryOpportunity
        ? (titleById.get(primaryOpportunity.columnId) ?? null)
        : null,
      primaryOpportunity,
    }
  })
}

export function buildLinkedCrmSnapshot(
  clients: Client[],
  columns: KanbanColumn[],
  cards: KanbanCard[],
): LinkedCrmSnapshot {
  const resolvedColumns = resolveDefaultColumns(columns)
  const mergedCards = mergeClientOpportunities(clients, resolvedColumns, cards)
  const enrichedCards = enrichCardsWithClients(mergedCards, clients, resolvedColumns)

  return {
    clients: enrichClientsWithPipeline(clients, mergedCards, resolvedColumns),
    columns: resolvedColumns,
    cards: enrichedCards,
  }
}
