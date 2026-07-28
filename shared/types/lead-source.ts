import type { TranslationKey } from '../i18n'

/** Origem do lead/cliente — preparado para ingestão futura via Meta Ads / campanhas. */
export type LeadSource = 'manual' | 'meta_ads' | 'campaign' | 'import'

/** Labels PT — fallback; UI deve preferir `t()` via LEAD_SOURCE_LABEL_KEYS. */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  manual: 'Manual',
  meta_ads: 'Meta Ads',
  campaign: 'Campanha',
  import: 'Importação',
}

export const LEAD_SOURCE_LABEL_KEYS: Record<LeadSource, TranslationKey> = {
  manual: 'crm.srcManual',
  meta_ads: 'crm.srcMetaAds',
  campaign: 'crm.srcCampaign',
  import: 'crm.srcImport',
}

type TranslateFn = (key: TranslationKey) => string

export function getLeadSourceLabel(t: TranslateFn, source: LeadSource): string {
  return t(LEAD_SOURCE_LABEL_KEYS[source])
}

export type LeadAttribution = {
  source: LeadSource
  /** ID da campanha interna (`campaigns`) quando o lead veio de anúncio. */
  campaignId?: string
  /** ID externo do lead (ex.: Meta Lead Ads form / leadgen id). */
  externalLeadId?: string
}
