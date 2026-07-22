import { httpsCallable, type FunctionsError } from 'firebase/functions'
import {
  AiOrchestrationError,
  configureAiCallableClient,
  type CampaignRequest,
  type CampaignResponse,
  type LeadInsightRequest,
  type LeadInsightResponse,
  type SmartRepliesRequest,
  type SmartRepliesResponse,
} from '@shared/services/ai-orchestration-service'
import { getFirebaseFunctions } from './firebase-functions'

function mapFunctionsError(error: unknown): AiOrchestrationError {
  const functionsError = error as FunctionsError | undefined
  const code = functionsError?.code

  if (code === 'functions/failed-precondition') {
    return new AiOrchestrationError(
      'not_configured',
      functionsError?.message || 'Provedor de IA não configurado no backend.',
    )
  }

  if (code === 'functions/deadline-exceeded') {
    return new AiOrchestrationError('timeout', 'A geração de IA excedeu o tempo limite.')
  }

  return new AiOrchestrationError(
    'provider_error',
    functionsError?.message || 'Falha ao gerar conteúdo com IA.',
  )
}

export function bootstrapAiOrchestration() {
  configureAiCallableClient({
    async generateCampaignContent(request: CampaignRequest): Promise<CampaignResponse> {
      try {
        const callable = httpsCallable<CampaignRequest, CampaignResponse>(
          getFirebaseFunctions(),
          'generateCampaignContent',
        )
        const result = await callable(request)
        return result.data
      } catch (error) {
        throw mapFunctionsError(error)
      }
    },

    async generateLeadInsight(request: LeadInsightRequest): Promise<LeadInsightResponse> {
      try {
        const callable = httpsCallable<LeadInsightRequest, LeadInsightResponse>(
          getFirebaseFunctions(),
          'generateLeadInsight',
        )
        const result = await callable(request)
        return result.data
      } catch (error) {
        throw mapFunctionsError(error)
      }
    },

    async generateSmartReplies(request: SmartRepliesRequest): Promise<SmartRepliesResponse> {
      try {
        const callable = httpsCallable<SmartRepliesRequest, SmartRepliesResponse>(
          getFirebaseFunctions(),
          'generateSmartReplies',
        )
        const result = await callable(request)
        return result.data
      } catch (error) {
        throw mapFunctionsError(error)
      }
    },
  })
}
