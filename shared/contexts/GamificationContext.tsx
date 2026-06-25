import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { INITIAL_GAMIFICATION_STATE, mergeGamificationState, toPersistedGamificationState } from '../constants/initial-gamification-state'
import { getGamificationPersistence } from '../services/gamification-persistence'
import { GamificationContext, type GamificationContextValue } from './gamification-context'
import { useAuth } from './useAuth'
import type {
  BusinessHealthScores,
  MissionImpactCategory,
  RecentActivityItem,
  UserGamificationState,
} from '../types/gamification'
import {
  DEFAULT_GROWTH_ACTION,
  GROWTH_ACTIONS,
} from '../constants/growth-actions'
import {
  applyBusinessHealthImpact,
  resolveCompanyTier,
} from '../utils/gamification-helpers'
import { generateId } from '../utils/generate-id'
import type { TimelineActionItem, UserProfile } from '../types/gamification'

const PERSIST_DEBOUNCE_MS = 700

type GamificationProviderProps = {
  children: ReactNode
  initialState?: UserGamificationState
}

const MISSION_ACTIVITY_LABELS: Record<MissionImpactCategory, string> = {
  marketing: 'Missão de Marketing concluída',
  vendas: 'Missão de Vendas concluída',
  automacao: 'Fluxo de Automação ativado',
  credibilidade: 'Ativo de Credibilidade publicado',
  posicionamento: 'Posicionamento de marca reforçado',
}

function resolveXpProgress(currentXp: number, nextLevelXp: number): number {
  if (nextLevelXp <= 0) {
    return 0
  }

  return Math.min(1, Math.max(0, currentXp / nextLevelXp))
}

function resolveActivityDateLabel(): string {
  return 'Hoje'
}

function createActivityEntry(
  impactCategory: MissionImpactCategory,
  impactValue: number,
): RecentActivityItem {
  return {
    id: generateId(),
    date: resolveActivityDateLabel(),
    action: `${MISSION_ACTIVITY_LABELS[impactCategory]} (+${impactValue} pts)`,
    type: impactCategory,
  }
}

function createTimelineEntry(
  actionId: string,
  title: string,
  xpGained: number,
  revenueGained: number,
  type: TimelineActionItem['type'],
): TimelineActionItem {
  return {
    id: generateId(),
    actionId,
    title,
    executedAt: resolveActivityDateLabel(),
    xpGained,
    revenueGained,
    type,
  }
}

function applyXpReward(state: UserGamificationState, xpReward: number): UserGamificationState {
  if (xpReward <= 0) {
    return state
  }

  let nextXp = state.economy.currentXp + xpReward
  let nextLevel = state.level
  let nextMaxXp = state.economy.nextLevelXp
  let nextTitle = state.title

  while (nextXp >= nextMaxXp) {
    nextXp -= nextMaxXp
    nextLevel += 1
    nextMaxXp = Math.round(nextMaxXp * 1.15)
    nextTitle = `Level ${nextLevel} Achiever`
  }

  return {
    ...state,
    level: nextLevel,
    title: nextTitle,
    economy: {
      ...state.economy,
      currentXp: nextXp,
      nextLevelXp: nextMaxXp,
    },
  }
}

export function GamificationProvider({
  children,
  initialState = INITIAL_GAMIFICATION_STATE,
}: GamificationProviderProps) {
  const { currentUser, isAuthLoading } = useAuth()
  const userId = currentUser?.id ?? null

  const [state, setState] = useState<UserGamificationState>(initialState)
  const [isHydrated, setIsHydrated] = useState(false)
  const skipNextPersistRef = useRef(false)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    let isCancelled = false

    async function hydrateGamification() {
      setIsHydrated(false)
      skipNextPersistRef.current = true

      if (!userId) {
        if (!isCancelled) {
          setState(INITIAL_GAMIFICATION_STATE)
          setIsHydrated(true)
        }
        return
      }

      try {
        const persisted = await getGamificationPersistence().load(userId)
        if (!isCancelled) {
          setState(persisted ? mergeGamificationState(persisted) : INITIAL_GAMIFICATION_STATE)
        }
      } catch {
        if (!isCancelled) {
          setState(INITIAL_GAMIFICATION_STATE)
        }
      } finally {
        if (!isCancelled) {
          setIsHydrated(true)
        }
      }
    }

    void hydrateGamification()

    return () => {
      isCancelled = true
    }
  }, [userId, isAuthLoading])

  useEffect(() => {
    if (!isHydrated || !userId) {
      return
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }

    const timer = setTimeout(() => {
      void getGamificationPersistence()
        .save(userId, toPersistedGamificationState(state), {
          email: currentUser?.email,
        })
        .catch(() => {
          // Falha de rede não deve quebrar a UI; cache local cobre leitura offline.
        })
    }, PERSIST_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [state, userId, isHydrated, currentUser?.email])

  const addXp = useCallback((amount: number) => {
    setState((current) => applyXpReward(current, amount))
  }, [])

  const completeMission = useCallback(
    (
      xpReward: number,
      coinReward: number,
      impactCategory: MissionImpactCategory,
      impactValue: number,
    ) => {
      if (xpReward < 0 || coinReward < 0 || impactValue < 0) {
        return
      }

      setState((current) => {
        const withXp = applyXpReward(current, xpReward)
        const nextBusinessHealth = applyBusinessHealthImpact(
          withXp.businessHealth,
          impactCategory,
          impactValue,
        )

        return {
          ...withXp,
          businessHealth: nextBusinessHealth,
          companyTier: resolveCompanyTier(nextBusinessHealth.totalScore),
          economy: {
            ...withXp.economy,
            coins: withXp.economy.coins + coinReward,
          },
          completedActions: withXp.completedActions + 1,
          influencePoints: withXp.influencePoints + Math.round(xpReward * 0.5),
          recentActivity: [
            createActivityEntry(impactCategory, impactValue),
            ...withXp.recentActivity,
          ].slice(0, 20),
        }
      })
    },
    [],
  )

  const incrementCompletedActions = useCallback((amount = 1) => {
    if (amount <= 0) {
      return
    }

    setState((current) => ({
      ...current,
      completedActions: current.completedActions + amount,
    }))
  }, [])

  const incrementInfluencePoints = useCallback((amount: number) => {
    if (amount <= 0) {
      return
    }

    setState((current) => ({
      ...current,
      influencePoints: current.influencePoints + amount,
    }))
  }, [])

  const updateStreak = useCallback((days: number) => {
    if (days < 0) {
      return
    }

    setState((current) => ({
      ...current,
      streakDays: days,
    }))
  }, [])

  const setUserProfile = useCallback((profile: UserProfile) => {
    setState((current) => ({
      ...current,
      userProfile: profile,
    }))
  }, [])

  const setCompanyStage = useCallback((stage: UserGamificationState['companyStage']) => {
    setState((current) => ({
      ...current,
      companyStage: stage,
    }))
  }, [])

  const executeAction = useCallback((actionId: string) => {
    const action = GROWTH_ACTIONS[actionId] ?? {
      ...DEFAULT_GROWTH_ACTION,
      title: `${DEFAULT_GROWTH_ACTION.title} (${actionId})`,
    }

    setState((current) => {
      const withXp = applyXpReward(current, action.xpReward)
      const impactValue = Math.round(action.xpReward * 0.08)
      const nextBusinessHealth = applyBusinessHealthImpact(
        withXp.businessHealth,
        action.impactCategory,
        impactValue,
      )

      return {
        ...withXp,
        businessHealth: nextBusinessHealth,
        companyTier: resolveCompanyTier(nextBusinessHealth.totalScore),
        potentialRevenue: withXp.potentialRevenue + action.revenueGain,
        completedActions: withXp.completedActions + 1,
        influencePoints: withXp.influencePoints + Math.round(action.xpReward * 0.5),
        timeline: [
          createTimelineEntry(
            actionId,
            action.title,
            action.xpReward,
            action.revenueGain,
            action.impactCategory,
          ),
          ...withXp.timeline,
        ].slice(0, 30),
        recentActivity: [
          {
            id: generateId(),
            date: resolveActivityDateLabel(),
            action: `IA executou: ${action.title} (+R$ ${action.revenueGain.toLocaleString('pt-BR')})`,
            type: action.impactCategory,
          },
          ...withXp.recentActivity,
        ].slice(0, 20),
      }
    })
  }, [])

  const contextValue = useMemo<GamificationContextValue>(() => {
    const { currentXp, nextLevelXp } = state.economy
    const xpProgress = resolveXpProgress(currentXp, nextLevelXp)
    const xpRemaining = Math.max(0, nextLevelXp - currentXp)

    return {
      ...state,
      currentXp,
      maxXp: nextLevelXp,
      xpProgress,
      xpRemaining,
      isOnboardingComplete: state.userProfile !== null,
      addXp,
      completeMission,
      executeAction,
      setUserProfile,
      setCompanyStage,
      incrementCompletedActions,
      incrementInfluencePoints,
      updateStreak,
    }
  }, [
    state,
    addXp,
    completeMission,
    executeAction,
    setUserProfile,
    setCompanyStage,
    incrementCompletedActions,
    incrementInfluencePoints,
    updateStreak,
  ])

  return (
    <GamificationContext.Provider value={contextValue}>{children}</GamificationContext.Provider>
  )
}

export { useGamification } from './useGamification'
