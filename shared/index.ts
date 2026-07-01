export * from './types'
export * from './data'
export * from './storage'
export * from './services'
export * from './contexts'
export * from './constants/firestore-collections'
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
export { generateCampaignContent } from './utils/generate-campaign-content'
export type {
  CampaignPreviewCard,
  GeneratedCampaignContent,
} from './utils/generate-campaign-content'
