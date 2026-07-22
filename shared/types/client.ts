import type { LeadAttribution, LeadSource } from './lead-source'

export type ClientStatus = 'ativo' | 'prospecto' | 'inativo'

export type Client = {
  id: string
  userId: string
  name: string
  company: string
  email: string
  phone?: string
  status: ClientStatus
  lastContact: string
  notes?: string
  source: LeadSource
  campaignId?: string
  externalLeadId?: string
  createdAt: string
  updatedAt: string
}

export type CreateClientInput = {
  userId: string
  name: string
  company: string
  email: string
  phone?: string
  status?: ClientStatus
  notes?: string
  attribution?: LeadAttribution
}
