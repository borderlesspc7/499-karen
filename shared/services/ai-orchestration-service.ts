/**
 * Orquestração de IA — ponto único de integração futura com providers (OpenAI, Gemini, etc.).
 *
 * A UI e os fluxos de produto devem depender apenas destas interfaces e funções.
 * Quando a API key estiver disponível, substitua apenas a implementação interna de `callAiProvider`.
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
  provider: 'mock' | 'openai' | 'gemini' | 'custom'
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

export type AiOrchestrationErrorCode =
  | 'not_configured'
  | 'provider_error'
  | 'timeout'
  | 'invalid_response'

export class AiOrchestrationError extends Error {
  readonly code: AiOrchestrationErrorCode

  constructor(code: AiOrchestrationErrorCode, message: string) {
    super(message)
    this.name = 'AiOrchestrationError'
    this.code = code
  }
}

type AiProviderConfig = {
  apiKey?: string
  baseUrl?: string
  model?: string
}

let providerConfig: AiProviderConfig = {}

/** Configura credenciais do provider sem acoplar o restante do app. */
export function configureAiOrchestration(config: AiProviderConfig) {
  providerConfig = { ...providerConfig, ...config }
}

export function getAiOrchestrationConfig(): Readonly<AiProviderConfig> {
  return providerConfig
}

/**
 * Hook interno — único lugar onde um `fetch` real deve viver no futuro.
 * Hoje simula latência e retorna conteúdo determinístico.
 */
async function callAiProvider<TInput, TOutput>(
  _operation: string,
  input: TInput,
  mockFactory: (input: TInput) => TOutput,
): Promise<TOutput> {
  // TODO(ai): quando a API key chegar, implementar fetch aqui e mapear TOutput.
  // if (!providerConfig.apiKey) throw new AiOrchestrationError('not_configured', '...')
  await delay(350)
  return mockFactory(input)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function generateCampaignContent(
  request: CampaignRequest,
): Promise<CampaignResponse> {
  return callAiProvider('generateCampaignContent', request, (input) => {
    const language = input.language ?? 'pt-BR'
    const isPt = language === 'pt-BR'

    return {
      headline: isPt
        ? `${input.offer}: feito para ${input.audience}`
        : `${input.offer}: built for ${input.audience}`,
      body: isPt
        ? `Campanha com foco em "${input.objective}". Mensagem alinhada à marca${
            input.brandContext ? ` (${input.brandContext.slice(0, 80)}…)` : ''
          }.`
        : `Campaign focused on "${input.objective}". Brand-aligned messaging.`,
      cta: isPt ? 'Quero saber mais' : 'Learn more',
      channelCopy: {
        instagram: isPt
          ? `✨ ${input.offer}\nPara ${input.audience}.\nObjetivo: ${input.objective}`
          : `✨ ${input.offer}\nFor ${input.audience}.\nGoal: ${input.objective}`,
        linkedin: isPt
          ? `Estamos lançando ${input.offer} para ${input.audience}. Objetivo: ${input.objective}.`
          : `Launching ${input.offer} for ${input.audience}. Goal: ${input.objective}.`,
        email: isPt
          ? `Assunto: ${input.offer} para ${input.audience}\n\nOlá,\n\nPreparamos algo alinhado ao seu momento: ${input.objective}.`
          : `Subject: ${input.offer} for ${input.audience}\n\nHi,\n\nWe prepared something for your stage: ${input.objective}.`,
      },
      estimatedLeads: 120,
      provider: 'mock',
    }
  })
}

export async function generateLeadInsight(
  request: LeadInsightRequest,
): Promise<LeadInsightResponse> {
  return callAiProvider('generateLeadInsight', request, (input) => ({
    nextBestAction: `Follow-up personalizado com ${input.clientName ?? 'o lead'} na etapa ${input.columnTitle}`,
    rationale: `Com base em "${input.leadTitle}", o maior impacto agora é reduzir atrito e avançar no funil.`,
    urgency: 'medium',
    provider: 'mock',
  }))
}
