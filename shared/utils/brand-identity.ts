import type { BrandIdentity, BrandIdentityDraft, TargetClientType } from '../types/brand-identity'
import type { UserProfile } from '../types/gamification'

export const TARGET_CLIENT_LABELS: Record<TargetClientType, string> = {
  'mulheres-estetica': 'Mulheres interessadas em estética e bem-estar',
  executivos: 'Profissionais executivos e empresários',
  'noivas-eventos': 'Noivas e preparação para eventos especiais',
  'premium-alto-ticket': 'Público premium / alto ticket',
  'publico-local': 'Público local (bairro / cidade)',
  outro: 'Outro perfil de cliente',
}

export const DEFAULT_BRAND_COLORS = {
  primary: '#3B82F6',
  secondary: '#0F172A',
  accent: '#F59E0B',
} as const

export function isValidHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{6})$/.test(value)
}

export function normalizeHexColor(value: string, fallback: string): string {
  const trimmed = value.trim()
  if (isValidHexColor(trimmed)) {
    return trimmed.toUpperCase()
  }

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (isValidHexColor(withHash)) {
    return withHash.toUpperCase()
  }

  return fallback
}

export function isBrandIdentityComplete(draft: Partial<BrandIdentityDraft>): boolean {
  return (
    Boolean(draft.companyName?.trim()) &&
    Boolean(draft.servicesDescription?.trim()) &&
    Boolean(draft.targetClientType) &&
    Boolean(draft.colors?.primary && draft.colors.secondary && draft.colors.accent)
  )
}

export function createBrandIdentity(draft: BrandIdentityDraft): BrandIdentity {
  return {
    companyName: draft.companyName.trim(),
    servicesDescription: draft.servicesDescription.trim(),
    targetClientType: draft.targetClientType,
    targetClientDescription: draft.targetClientDescription.trim(),
    logoUri: draft.logoUri,
    colors: {
      primary: normalizeHexColor(draft.colors.primary, DEFAULT_BRAND_COLORS.primary),
      secondary: normalizeHexColor(draft.colors.secondary, DEFAULT_BRAND_COLORS.secondary),
      accent: normalizeHexColor(draft.colors.accent, DEFAULT_BRAND_COLORS.accent),
    },
    completedAt: new Date().toISOString(),
  }
}

export function buildBrandAiContext(
  brandIdentity: BrandIdentity,
  businessProfile: UserProfile | null,
): string {
  const targetLabel = TARGET_CLIENT_LABELS[brandIdentity.targetClientType]
  const targetDetail = brandIdentity.targetClientDescription.trim()

  return [
    `Empresa: ${brandIdentity.companyName}`,
    businessProfile ? `Segmento: ${businessProfile}` : null,
    `Serviços/produtos: ${brandIdentity.servicesDescription}`,
    `Público-alvo principal: ${targetLabel}${targetDetail ? ` — ${targetDetail}` : ''}`,
    `Cores da marca: primária ${brandIdentity.colors.primary}, secundária ${brandIdentity.colors.secondary}, destaque ${brandIdentity.colors.accent}`,
    brandIdentity.logoUri ? 'Logo da marca disponível para referência visual.' : null,
  ]
    .filter(Boolean)
    .join('\n')
}
