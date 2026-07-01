import type { BrandIdentity } from '../types/brand-identity'
import type { UserProfile } from '../types/gamification'
import { TARGET_CLIENT_LABELS } from './brand-identity'

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

type GenerateCampaignInput = {
  userPrompt: string
  brandIdentity: BrandIdentity | null
  brandAiContext: string | null
  userProfile: UserProfile | null
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

export function generateCampaignContent(input: GenerateCampaignInput): GeneratedCampaignContent {
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
