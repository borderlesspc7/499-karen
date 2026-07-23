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
  configureSubscriptionBackend,
  configureSubscriptionPersistence,
  getSubscriptionBackend,
  getSubscriptionPersistence,
  type SubscriptionBackend,
  type SubscriptionListener,
  type SubscriptionPersistence,
} from './subscription-backend'
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
  buildRevenueKpisFromMetrics,
  computeDailyMetrics,
  computeReportsSnapshot,
  computeRevenueCenterSnapshot,
  computeRevenueOpportunities,
  type AnalyticsInput,
} from './analytics-service'
export {
  AiOrchestrationError,
  configureAiCallableClient,
  generateCampaignContent as generateCampaignViaProvider,
  generateLeadInsight,
  generateSmartReplies,
  type AiOrchestrationErrorCode,
  type CampaignRequest,
  type CampaignResponse,
  type LeadInsightRequest,
  type LeadInsightResponse,
  type SmartRepliesRequest,
  type SmartRepliesResponse,
} from './ai-orchestration-service'
