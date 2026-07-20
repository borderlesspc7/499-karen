export { AuthError, MockAuthError, getAuthErrorMessage, isAuthError, mapFirebaseAuthError } from './auth-error'
export {
  configureAuthBackend,
  getAuthBackend,
  type AuthBackend,
} from './auth-backend'
export {
  configureGamificationPersistence,
  getGamificationPersistence,
  type GamificationPersistence,
} from './gamification-persistence'
export {
  buildRevenueCenterSnapshot,
  buildRevenueKpis,
  formatCurrencyBrl,
  formatCurrencyBrlCompact,
  OPPORTUNITY_VARIANTS,
  type OpportunityVariant,
  type RevenueCenterSnapshot,
  type RevenueDailyMetrics,
  type RevenueKpi,
  type RevenueOpportunity,
  type RevenueOpportunityType,
} from './revenue-center'
export {
  AiOrchestrationError,
  configureAiOrchestration,
  generateCampaignContent as generateCampaignViaProvider,
  generateLeadInsight,
  getAiOrchestrationConfig,
  type AiOrchestrationErrorCode,
  type CampaignRequest,
  type CampaignResponse,
  type LeadInsightRequest,
  type LeadInsightResponse,
} from './ai-orchestration-service'
