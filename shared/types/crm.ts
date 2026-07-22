import type { LeadAttribution, LeadSource } from './lead-source'

export type TaskCategory = 'vendas' | 'suporte' | 'marketing' | 'follow-up'

export type TaskPriority = 'baixa' | 'media' | 'alta'

export type KanbanColumn = {
  id: string
  userId: string
  title: string
  order: number
}

export type KanbanCard = {
  id: string
  userId: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  clientId?: string
  clientName: string
  dueDate: string
  columnId: string
  order: number
  /** Valor estimado/fechado do negócio em BRL. */
  dealValue: number
  source: LeadSource
  campaignId?: string
  externalLeadId?: string
  createdAt: string
  updatedAt: string
}

export type CreateOpportunityInput = {
  userId: string
  title: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  clientId?: string
  clientName?: string
  dueDate?: string
  columnId: string
  dealValue?: number
  attribution?: LeadAttribution
}

export type CategoryFilter = TaskCategory | 'todas'
