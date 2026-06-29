import { createContext } from 'react'
import type {
  CompanyStage,
  MissionImpactCategory,
  UserGamificationState,
  UserProfile,
} from '../types/gamification'

export type GamificationContextValue = UserGamificationState & {
  /** Retrocompatibilidade com consumidores legados */
  currentXp: number
  maxXp: number
  xpProgress: number
  xpRemaining: number
  isHydrated: boolean
  isOnboardingComplete: boolean
  addXp: (amount: number) => void
  completeMission: (
    xpReward: number,
    coinReward: number,
    impactCategory: MissionImpactCategory,
    impactValue: number,
  ) => void
  executeAction: (actionId: string) => void
  setUserProfile: (profile: UserProfile) => void
  setCompanyStage: (stage: CompanyStage) => void
  incrementCompletedActions: (amount?: number) => void
  incrementInfluencePoints: (amount: number) => void
  updateStreak: (days: number) => void
}

export const GamificationContext = createContext<GamificationContextValue | undefined>(undefined)
