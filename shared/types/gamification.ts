export type GamificationLevel = {
  level: number
  title: string
}

export type BusinessHealthCategoryKey =
  | 'marketing'
  | 'vendas'
  | 'automacao'
  | 'credibilidade'
  | 'posicionamento'

export type BusinessHealthScores = {
  marketing: number
  vendas: number
  automacao: number
  credibilidade: number
  posicionamento: number
  totalScore: number
}

export type CompanyTier =
  | 'Iniciante'
  | 'Estruturada'
  | 'Em Crescimento'
  | 'Escalável'
  | 'Dominante'

export type GamificationEconomy = {
  currentXp: number
  nextLevelXp: number
  coins: number
}

export type RecentActivityItem = {
  id: string
  date: string
  action: string
  type: BusinessHealthCategoryKey | 'general'
}

export type MissionImpactCategory = BusinessHealthCategoryKey

export type GamificationStats = {
  streakDays: number
  influencePoints: number
  completedActions: number
}

import type { BrandIdentity } from './brand-identity'

export type UserProfile =
  | 'Clínica'
  | 'Med Spa'
  | 'Agência'
  | 'E-commerce'
  | 'Consultor'
  | 'Empresário'

export type CompanyStage = 'Iniciante' | 'Estruturada' | 'Escalável'

export type TimelineActionItem = {
  id: string
  actionId: string
  title: string
  executedAt: string
  xpGained: number
  revenueGained: number
  type: BusinessHealthCategoryKey | 'general'
}

export type UserGamificationState = GamificationLevel &
  GamificationStats & {
    userProfile: UserProfile | null
    brandIdentity: BrandIdentity | null
    companyStage: CompanyStage
    potentialRevenue: number
    businessHealth: BusinessHealthScores
    companyTier: CompanyTier
    economy: GamificationEconomy
    recentActivity: RecentActivityItem[]
    timeline: TimelineActionItem[]
  }

/** @deprecated Use `economy.currentXp` — mantido para retrocompatibilidade */
export type GamificationProgress = {
  currentXp: number
  maxXp: number
}
