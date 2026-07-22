import type { Client, CreateClientInput, CreateOpportunityInput, KanbanCard } from '../types'
import { generateId } from './generate-id'

/**
 * Helper futuro para ingestão de Lead Ads da Meta.
 * Quando a integração estiver ativa, o webhook/callable deve montar Client + Opportunity
 * com `source: 'meta_ads'` e `campaignId` / `externalLeadId`.
 */
export function buildMetaAdsLeadDraft(input: {
  userId: string
  name: string
  email?: string
  phone?: string
  company?: string
  campaignId: string
  externalLeadId: string
  dealValue?: number
  columnId?: string
}): {
  client: CreateClientInput
  opportunity: Omit<CreateOpportunityInput, 'userId'> & { userId: string }
} {
  return {
    client: {
      userId: input.userId,
      name: input.name,
      company: input.company ?? '—',
      email: input.email ?? '—',
      phone: input.phone,
      status: 'prospecto',
      attribution: {
        source: 'meta_ads',
        campaignId: input.campaignId,
        externalLeadId: input.externalLeadId,
      },
    },
    opportunity: {
      userId: input.userId,
      title: `Lead Meta — ${input.name}`,
      description: 'Lead capturado via anúncio Meta Ads.',
      category: 'vendas',
      priority: 'media',
      clientName: input.name,
      columnId: input.columnId ?? 'col-leads',
      dealValue: input.dealValue ?? 0,
      attribution: {
        source: 'meta_ads',
        campaignId: input.campaignId,
        externalLeadId: input.externalLeadId,
      },
    },
  }
}

/** Garante IDs estáveis para upsert idempotente por leadgen id da Meta. */
export function buildMetaScopedEntityIds(userId: string, externalLeadId: string): {
  clientId: string
  opportunityId: string
} {
  const safeExternalId = externalLeadId.replace(/[^a-zA-Z0-9_-]/g, '')
  return {
    clientId: `meta-${safeExternalId || generateId()}`,
    opportunityId: `meta-opp-${safeExternalId || generateId()}`,
  }
}

export function attachMetaIdsToClient(
  draft: CreateClientInput,
  clientId: string,
): Client {
  const now = new Date().toISOString()
  const attribution = draft.attribution ?? { source: 'meta_ads' as const }

  return {
    id: clientId,
    userId: draft.userId,
    name: draft.name,
    company: draft.company,
    email: draft.email,
    phone: draft.phone,
    status: draft.status ?? 'prospecto',
    lastContact: new Date().toLocaleDateString('pt-BR'),
    notes: draft.notes,
    source: attribution.source,
    campaignId: attribution.campaignId,
    externalLeadId: attribution.externalLeadId,
    createdAt: now,
    updatedAt: now,
  }
}

export function attachMetaIdsToOpportunity(
  draft: CreateOpportunityInput,
  opportunityId: string,
  clientId?: string,
): KanbanCard {
  const now = new Date().toISOString()
  const attribution = draft.attribution ?? { source: 'meta_ads' as const }

  return {
    id: opportunityId,
    userId: draft.userId,
    title: draft.title,
    description: draft.description ?? '',
    category: draft.category ?? 'vendas',
    priority: draft.priority ?? 'media',
    clientId,
    clientName: draft.clientName ?? '—',
    dueDate: draft.dueDate ?? new Date().toLocaleDateString('pt-BR'),
    columnId: draft.columnId,
    order: 0,
    dealValue: draft.dealValue ?? 0,
    source: attribution.source,
    campaignId: attribution.campaignId,
    externalLeadId: attribution.externalLeadId,
    createdAt: now,
    updatedAt: now,
  }
}
