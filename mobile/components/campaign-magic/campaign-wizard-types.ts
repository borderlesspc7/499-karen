import type { TranslationKey, TranslationParams } from '@shared/i18n'

export type CampaignObjective =
  | 'sell'
  | 'schedule'
  | 'authority'
  | 'reactivate'
  | 'promote'

export type CampaignWizardData = {
  objective: CampaignObjective | null
  audience: string
  offer: string
}

type TranslateFn = (key: TranslationKey, params?: TranslationParams) => string

export const CAMPAIGN_OBJECTIVES: {
  id: CampaignObjective
  labelKey: TranslationKey
  descriptionKey: TranslationKey
}[] = [
  { id: 'sell', labelKey: 'campaigns.objSell', descriptionKey: 'campaigns.objSellDesc' },
  {
    id: 'schedule',
    labelKey: 'campaigns.objSchedule',
    descriptionKey: 'campaigns.objScheduleDesc',
  },
  {
    id: 'authority',
    labelKey: 'campaigns.objAuthority',
    descriptionKey: 'campaigns.objAuthorityDesc',
  },
  {
    id: 'reactivate',
    labelKey: 'campaigns.objReactivate',
    descriptionKey: 'campaigns.objReactivateDesc',
  },
  { id: 'promote', labelKey: 'campaigns.objPromote', descriptionKey: 'campaigns.objPromoteDesc' },
]

export const OFFER_SUGGESTION_KEYS = [
  'campaigns.sugConsulting',
  'campaigns.sugFacial',
  'campaigns.sugDental',
  'campaigns.sugFunnel',
  'campaigns.sugLoyalty',
] as const satisfies readonly TranslationKey[]

export const AUDIENCE_CHIP_KEYS = [
  'campaigns.chipWomen',
  'campaigns.chipLocal',
  'campaigns.chipClinics',
  'campaigns.chipPros',
  'campaigns.chipEcommerce',
] as const satisfies readonly TranslationKey[]

export function buildCampaignPrompt(data: CampaignWizardData, t: TranslateFn): string {
  const objective = CAMPAIGN_OBJECTIVES.find((o) => o.id === data.objective)
  const parts = [
    objective ? t('campaigns.promptObjective', { label: t(objective.labelKey) }) : '',
    data.audience ? t('campaigns.promptAudience', { audience: data.audience }) : '',
    data.offer ? t('campaigns.promptOffer', { offer: data.offer }) : '',
  ].filter(Boolean)

  return parts.join(' ')
}

export function computeApprovalSummary(pieceCount: number) {
  return {
    channels: ['Instagram', 'Facebook', 'LinkedIn', 'E-mail'],
    pieceCount,
    hoursSaved: 17,
    estimatedLeads: 247,
    expectedRoi: 6.4,
  }
}
