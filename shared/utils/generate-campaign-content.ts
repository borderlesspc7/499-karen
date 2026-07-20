import type { BrandIdentity } from '../types/brand-identity'
import type { UserProfile } from '../types/gamification'
import { TARGET_CLIENT_LABELS } from './brand-identity'
import {
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

/** Fallback síncrono local (sem provider de IA). */
export function buildLocalCampaignContent(input: GenerateCampaignInput): GeneratedCampaignContent {
  const { userPrompt, brandIdentity, brandAiContext, userProfile } = input

  const companyName = brandIdentity?.companyName ?? 'sua empresa'
  const offering = resolvePrimaryOffering(brandIdentity)
  const audience = resolveAudienceLabel(brandIdentity)
  const theme = resolveCampaignTheme(userPrompt)
  const segment = userProfile ?? 'negócio'
  const accentColor = brandIdentity?.colors.accent ?? '#F59E0B'

  const brandNote = brandAiContext
    ? 'Conteúdo alinhado à identidade da marca cadastrada.'
    : 'Conteúdo genérico — complete a identidade da marca para personalização total.'

  return {
    social: [
      {
        id: 'ig-1',
        channel: 'Instagram',
        preview: `${companyName}: ${offering} pensado para ${audience.split('(')[0]?.trim() ?? audience}.`,
        detail: `Carrossel com CTA de agendamento, paleta ${accentColor} e foco em: ${theme}. ${brandNote}`,
      },
      {
        id: 'fb-1',
        channel: 'Facebook',
        preview: `Campanha ${theme} — ${companyName} conecta ${segment.toLowerCase()} ao cliente certo.`,
        detail: `Post com prova social, oferta clara de ${offering} e link para conversão. Tom adaptado ao público: ${audience}.`,
      },
      {
        id: 'li-1',
        channel: 'LinkedIn',
        preview: `Por que ${companyName} é referência em ${offering}?`,
        detail: `Artigo de autoridade para ${audience}, reforçando posicionamento e convite para ${theme}.`,
      },
    ],
    emails: [
      {
        id: 'email-1',
        subject: `${companyName} — conheça ${offering}`,
        preview: `Olá! Preparamos uma jornada exclusiva sobre ${theme}, ideal para ${audience}.`,
        detail: `E-mail de abertura com proposta de valor de ${offering} e identidade visual da marca.`,
      },
      {
        id: 'email-2',
        subject: `Últimas vagas — ${offering} na ${companyName}`,
        preview: `Restam poucas vagas esta semana para quem se encaixa em: ${audience}.`,
        detail: `Sequência de urgência ligada ao pedido: "${theme}". CTA com cor de destaque ${accentColor}.`,
      },
      {
        id: 'email-3',
        subject: `Resultados reais com ${companyName}`,
        preview: `Veja como clientes como o seu perfil (${audience}) já transformaram seus resultados.`,
        detail: `E-mail de prova social + FAQ sobre ${offering}. ${brandNote}`,
      },
    ],
    landing: [
      {
        id: 'lp-1',
        label: 'Headline',
        preview: `${offering} na ${companyName} — ${theme}`,
        detail: `Título principal com foco em conversão para ${audience}.`,
      },
      {
        id: 'lp-2',
        label: 'Subheadline',
        preview: `Protocolo personalizado para ${audience} que buscam ${offering} com excelência.`,
        detail: `Complemento alinhado ao segmento ${segment} e à identidade visual da marca.`,
      },
      {
        id: 'lp-3',
        label: 'CTA Principal',
        preview: `Quero saber mais sobre ${offering}`,
        detail: `Botão com destaque na cor ${accentColor}, microcopy de urgência e garantia de contato rápido.`,
      },
    ],
  }
}

/** @deprecated Use buildLocalCampaignContent — mantido para compatibilidade. */
export const generateCampaignContentSync = buildLocalCampaignContent

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
  input: GenerateCampaignInput,
): GeneratedCampaignContent {
  const local = buildLocalCampaignContent(input)
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
      ...local.emails.slice(1),
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
 * Entrada única usada pela UI: chama a orquestração de IA e adapta para o dashboard.
 * Se o provider falhar, usa o builder local como fallback.
 */
export async function generateCampaignContent(
  input: GenerateCampaignInput,
): Promise<GeneratedCampaignContent> {
  try {
    const response = await generateCampaignViaAi(toCampaignRequest(input))
    return adaptCampaignResponseToGeneratedContent(response, input)
  } catch {
    return buildLocalCampaignContent(input)
  }
}
