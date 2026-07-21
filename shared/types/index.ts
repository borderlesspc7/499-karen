export type {
  CreateSavedCampaignInput,
  SavedCampaign,
  SavedCampaignMetrics,
  SavedCampaignObjective,
  SavedCampaignStatus,
} from './campaign'
export type {
  BrandColors,
  BrandIdentity,
  BrandIdentityDraft,
  TargetClientType,
} from './brand-identity'
export type { AuthUser, MockUser } from './auth'
export type { Client, ClientStatus } from './client'
export type {
  CategoryFilter,
  KanbanCard,
  KanbanColumn,
  TaskCategory,
  TaskPriority,
} from './crm'
export type {
  BusinessHealthCategoryKey,
  BusinessHealthScores,
  CompanyStage,
  CompanyTier,
  GamificationEconomy,
  GamificationLevel,
  GamificationProgress,
  GamificationStats,
  MissionImpactCategory,
  RecentActivityItem,
  TimelineActionItem,
  UserGamificationState,
  UserProfile,
} from './gamification'
export type {
  ClientWithPipeline,
  KanbanCardWithClient,
  LinkedCrmSnapshot,
} from '../utils/link-crm-clients'
export type {
  InboxChannel,
  InboxContactStatus,
  InboxConversation,
  InboxMessage,
  InboxMessageRole,
  InboxPriority,
} from './inbox'
export type {
  GrowthDataPoint,
  ProgressMetric,
  ReportKpi,
  ReportsSnapshot,
} from './reports'
export type {
  IntegrationId,
  TeamMember,
  UserIntegrations,
  UserSettings,
} from './user-settings'
export { DEFAULT_INTEGRATIONS } from './user-settings'
export type {
  ChannelConnection,
  ChannelConnectionsSnapshot,
  ChannelConnectionStatus,
  MessagingChannel,
} from './channel-connection'
export { DEFAULT_CHANNEL_CONNECTIONS } from './channel-connection'