import type { BrandIdentity } from '../types/brand-identity'
import type { UserProfile } from '../types/gamification'
import { TARGET_CLIENT_LABELS } from './brand-identity'
import {
  AiOrchestrationError,
  generateCampaignContent as generateCampaignViaAi,
  type CampaignRequest,
  type CampaignResponse,
} from '../services/ai-orchestration-service'

export type CampaignPreviewCard = {
  id: string
  preview: string
  detail: string
  channel?: string
  subject?: string
  label?: string
}

export type GeneratedCampaignContent = {
  social: CampaignPreviewCard[]
  emails: CampaignPreviewCard[]
  landing: CampaignPreviewCard[]
}

export type GenerateCampaignInput = {
  userPrompt: string
  brandIdentity: BrandIdentity | null
  brandAiContext: string | null
  userProfile: UserProfile | null
  objective?: string
  audience?: string
  offer?: string
}

function resolvePrimaryOffering(brandIdentity: BrandIdentity | null): string {
  if (!brandIdentity?.servicesDescription.trim()) {
    return 'nossos serviços'
  }

  const firstOffering = brandIdentity.servicesDescription.split(/[,;]/)[0]?.trim()
  return firstOffering || brandIdentity.servicesDescription.trim()
}

function resolveCampaignTheme(userPrompt: string): string {
  const trimmed = userPrompt.trim()
  if (!trimmed) {
    return 'lançamento e divulgação'
  }

  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed
}

function resolveAudienceLabel(brandIdentity: BrandIdentity | null): string {
  if (!brandIdentity) {
    return 'seu público ideal'
  }

  const baseLabel = TARGET_CLIENT_LABELS[brandIdentity.targetClientType]
  const detail = brandIdentity.targetClientDescription.trim()
  return detail ? `${baseLabel} (${detail})` : baseLabel
}

export function toCampaignRequest(input: GenerateCampaignInput): CampaignRequest {
  return {
    objective: input.objective || resolveCampaignTheme(input.userPrompt),
    audience: input.audience || resolveAudienceLabel(input.brandIdentity),
    offer: input.offer || resolvePrimaryOffering(input.brandIdentity),
    brandContext: input.brandAiContext,
    tone: 'premium',
    language: 'pt-BR',
  }
}

/** Adapta a resposta do provider de IA para o formato da UI do Campaign Magic. */
export function adaptCampaignResponseToGeneratedContent(
  response: CampaignResponse,
): GeneratedCampaignContent {
  const providerNote = `Gerado via ${response.provider}${
    response.estimatedLeads ? ` · previsão ~${response.estimatedLeads} leads` : ''
  }.`

  return {
    social: [
      {
        id: 'ig-1',
        channel: 'Instagram',
        preview: response.channelCopy.instagram?.split('\n')[0] ?? response.headline,
        detail: `${response.channelCopy.instagram ?? response.body}\n\n${providerNote}`,
      },
      {
        id: 'fb-1',
        channel: 'Facebook',
        preview: response.headline,
        detail: `${response.body}\n\nCTA: ${response.cta}. ${providerNote}`,
      },
      {
        id: 'li-1',
        channel: 'LinkedIn',
        preview: response.channelCopy.linkedin?.slice(0, 120) ?? response.headline,
        detail: `${response.channelCopy.linkedin ?? response.body}\n\n${providerNote}`,
      },
    ],
    emails: [
      {
        id: 'email-1',
        subject: response.headline,
        preview: response.channelCopy.email?.split('\n\n')[1] ?? response.body,
        detail: `${response.channelCopy.email ?? response.body}\n\n${providerNote}`,
      },
    ],
    landing: [
      {
        id: 'lp-1',
        label: 'Headline',
        preview: response.headline,
        detail: providerNote,
      },
      {
        id: 'lp-2',
        label: 'Subheadline',
        preview: response.body,
        detail: providerNote,
      },
      {
        id: 'lp-3',
        label: 'CTA Principal',
        preview: response.cta,
        detail: providerNote,
      },
    ],
  }
}

/**
 * Entrada única usada pela UI: chama a orquestração de IA (Cloud Function).
 * Sem fallback de conteúdo inventado — erros devem ser tratados pela UI.
 */
export async function generateCampaignContent(
  input: GenerateCampaignInput,
): Promise<GeneratedCampaignContent> {
  try {
    const response = await generateCampaignViaAi(toCampaignRequest(input))
    return adaptCampaignResponseToGeneratedContent(response)
  } catch (error) {
    if (error instanceof AiOrchestrationError) {
      throw error
    }

    throw new AiOrchestrationError(
      'provider_error',
      error instanceof Error ? error.message : 'Falha ao gerar campanha.',
    )
  }
}
