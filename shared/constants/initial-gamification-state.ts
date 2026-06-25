import type { UserGamificationState } from '../types/gamification'
import {
  applyBusinessHealthImpact,
  calculateTotalScore,
  resolveCompanyTier,
} from '../utils/gamification-helpers'

const INITIAL_BUSINESS_HEALTH = {
  marketing: 72,
  vendas: 58,
  automacao: 45,
  credibilidade: 80,
  posicionamento: 65,
} as const

export const INITIAL_GAMIFICATION_STATE: UserGamificationState = {
  level: 12,
  title: 'Growth Builder',
  streakDays: 14,
  influencePoints: 2450,
  completedActions: 32,
  userProfile: null,
  companyStage: 'Iniciante',
  potentialRevenue: 8400,
  timeline: [],
  businessHealth: {
    ...INITIAL_BUSINESS_HEALTH,
    totalScore: calculateTotalScore(INITIAL_BUSINESS_HEALTH),
  },
  companyTier: resolveCompanyTier(calculateTotalScore(INITIAL_BUSINESS_HEALTH)),
  economy: {
    currentXp: 3150,
    nextLevelXp: 5000,
    coins: 420,
  },
  recentActivity: [
    {
      id: 'activity-1',
      date: 'Hoje',
      action: 'Criou campanha',
      type: 'marketing',
    },
    {
      id: 'activity-2',
      date: 'Ontem',
      action: 'Criou landing page',
      type: 'posicionamento',
    },
    {
      id: 'activity-3',
      date: '3 dias atrás',
      action: 'Configurou CRM',
      type: 'vendas',
    },
  ],
}

export type PersistedGamificationState = Pick<
  UserGamificationState,
  | 'level'
  | 'title'
  | 'streakDays'
  | 'influencePoints'
  | 'completedActions'
  | 'userProfile'
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
    businessHealth,
    companyTier: resolveCompanyTier(businessHealth.totalScore),
  }
}
