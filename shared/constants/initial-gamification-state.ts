import type { UserGamificationState } from '../types/gamification'
import {
  calculateTotalScore,
  resolveCompanyTier,
} from '../utils/gamification-helpers'

const EMPTY_BUSINESS_HEALTH = {
  marketing: 0,
  vendas: 0,
  automacao: 0,
  credibilidade: 0,
  posicionamento: 0,
} as const

export const INITIAL_GAMIFICATION_STATE: UserGamificationState = {
  level: 1,
  title: 'Starter',
  streakDays: 0,
  influencePoints: 0,
  completedActions: 0,
  userProfile: null,
  brandIdentity: null,
  companyStage: 'Iniciante',
  potentialRevenue: 0,
  timeline: [],
  businessHealth: {
    ...EMPTY_BUSINESS_HEALTH,
    totalScore: calculateTotalScore(EMPTY_BUSINESS_HEALTH),
  },
  companyTier: resolveCompanyTier(calculateTotalScore(EMPTY_BUSINESS_HEALTH)),
  economy: {
    currentXp: 0,
    nextLevelXp: 500,
    coins: 0,
  },
  recentActivity: [],
}

export type PersistedGamificationState = Pick<
  UserGamificationState,
  | 'level'
  | 'title'
  | 'streakDays'
  | 'influencePoints'
  | 'completedActions'
  | 'userProfile'
  | 'brandIdentity'
  | 'companyStage'
  | 'potentialRevenue'
  | 'businessHealth'
  | 'companyTier'
  | 'economy'
  | 'recentActivity'
  | 'timeline'
>

export function toPersistedGamificationState(
  state: UserGamificationState,
): PersistedGamificationState {
  return {
    level: state.level,
    title: state.title,
    streakDays: state.streakDays,
    influencePoints: state.influencePoints,
    completedActions: state.completedActions,
    userProfile: state.userProfile,
    brandIdentity: state.brandIdentity,
    companyStage: state.companyStage,
    potentialRevenue: state.potentialRevenue,
    businessHealth: state.businessHealth,
    companyTier: state.companyTier,
    economy: state.economy,
    recentActivity: state.recentActivity,
    timeline: state.timeline,
  }
}

export function mergeGamificationState(
  persisted: PersistedGamificationState,
): UserGamificationState {
  const businessHealth = {
    ...persisted.businessHealth,
    totalScore: calculateTotalScore(persisted.businessHealth),
  }

  return {
    ...persisted,
    brandIdentity: persisted.brandIdentity ?? null,
    businessHealth,
    companyTier: resolveCompanyTier(businessHealth.totalScore),
  }
}
