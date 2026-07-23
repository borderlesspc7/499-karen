export * from './types'
export * from './data'
export * from './storage'
export * from './services'
export * from './contexts'
export * from './constants/firestore-collections'
export {
  SUBSCRIPTION_PLANS,
  formatPlanPriceBrl,
  getSubscriptionPlan,
} from './constants/subscription-plans'
export {
  buildActiveSubscription,
  parseUserSubscription,
} from './utils/subscription-helpers'
export {
  buildLinkedCrmSnapshot,
  buildMissingClientOpportunityCards,
  dedupeCardsById,
  enrichCardsWithClients,
  enrichClientsWithPipeline,
  linkCardsToClients,
  mergeClientOpportunities,
  resolveDefaultColumns,
} from './utils/link-crm-clients'
export type {
  ClientWithPipeline,
  KanbanCardWithClient,
  LinkedCrmSnapshot,
} from './utils/link-crm-clients'
export { generateId } from './utils/generate-id'
export {
  buildBrandAiContext,
  createBrandIdentity,
  DEFAULT_BRAND_COLORS,
  isBrandIdentityComplete,
  TARGET_CLIENT_LABELS,
} from './utils/brand-identity'
export {
  adaptCampaignResponseToGeneratedContent,
  generateCampaignContent,
  toCampaignRequest,
} from './utils/generate-campaign-content'
export { scopedDocId } from './utils/scoped-doc-id'
export {
  attachMetaIdsToClient,
  attachMetaIdsToOpportunity,
  buildMetaAdsLeadDraft,
  buildMetaScopedEntityIds,
} from './utils/meta-lead-ingestion'
export type {
  CampaignPreviewCard,
  GenerateCampaignInput,
  GeneratedCampaignContent,
} from './utils/generate-campaign-content'
