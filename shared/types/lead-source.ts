/** Origem do lead/cliente — preparado para ingestão futura via Meta Ads / campanhas. */
export type LeadSource = 'manual' | 'meta_ads' | 'campaign' | 'import'

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  manual: 'Manual',
  meta_ads: 'Meta Ads',
  campaign: 'Campanha',
  import: 'Importação',
}

export type LeadAttribution = {
  source: LeadSource
  /** ID da campanha interna (`campaigns`) quando o lead veio de anúncio. */
  campaignId?: string
  /** ID externo do lead (ex.: Meta Lead Ads form / leadgen id). */
  externalLeadId?: string
}
