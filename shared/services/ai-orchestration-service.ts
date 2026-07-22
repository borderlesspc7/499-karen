/**
 * Orquestração de IA — chama Cloud Functions (Gemini/OpenAI via secret no backend).
 * Sem mock: se a function falhar ou não estiver configurada, propaga o erro.
 */

export type CampaignRequest = {
  objective: string
  audience: string
  offer: string
  brandContext?: string | null
  tone?: 'premium' | 'direct' | 'educational'
  language?: 'pt-BR' | 'en-US'
}

export type CampaignResponse = {
  headline: string
  body: string
  cta: string
  channelCopy: {
    instagram?: string
    linkedin?: string
    email?: string
  }
  estimatedLeads?: number
  provider: 'openai' | 'gemini' | 'custom'
  raw?: unknown
}

export type LeadInsightRequest = {
  leadTitle: string
  columnTitle: string
  clientName?: string
  recentNotes?: string
}

export type LeadInsightResponse = {
  nextBestAction: string
  rationale: string
  urgency: 'low' | 'medium' | 'high'
  provider: CampaignResponse['provider']
}

export type SmartRepliesRequest = {
  contactName: string
  channel: string
  preview: string
  lastMessages?: string[]
}

export type SmartRepliesResponse = {
  replies: string[]
  provider: CampaignResponse['provider']
}

export type AiOrchestrationErrorCode =
  | 'not_configured'
  | 'provider_error'
  | 'timeout'
  | 'invalid_response'
  | 'not_wired'

export class AiOrchestrationError extends Error {
  readonly code: AiOrchestrationErrorCode

  constructor(code: AiOrchestrationErrorCode, message: string) {
    super(message)
    this.name = 'AiOrchestrationError'
    this.code = code
  }
}

type AiCallableClient = {
  generateCampaignContent(request: CampaignRequest): Promise<CampaignResponse>
  generateLeadInsight(request: LeadInsightRequest): Promise<LeadInsightResponse>
  generateSmartReplies(request: SmartRepliesRequest): Promise<SmartRepliesResponse>
}

let callableClient: AiCallableClient | null = null

/** Injeta o cliente que chama as Cloud Functions (implementado no app mobile). */
export function configureAiCallableClient(client: AiCallableClient) {
  callableClient = client
}

function requireClient(): AiCallableClient {
  if (!callableClient) {
    throw new AiOrchestrationError(
      'not_wired',
      'Cliente de IA não configurado. Inicialize o Firebase AI callable no bootstrap.',
    )
  }

  return callableClient
}

export async function generateCampaignContent(
  request: CampaignRequest,
): Promise<CampaignResponse> {
  return requireClient().generateCampaignContent(request)
}

export async function generateLeadInsight(
  request: LeadInsightRequest,
): Promise<LeadInsightResponse> {
  return requireClient().generateLeadInsight(request)
}

export async function generateSmartReplies(
  request: SmartRepliesRequest,
): Promise<SmartRepliesResponse> {
  return requireClient().generateSmartReplies(request)
}
