import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { INITIAL_GAMIFICATION_STATE, mergeGamificationState, toPersistedGamificationState } from '../constants/initial-gamification-state'
import { getGamificationPersistence } from '../services/gamification-persistence'
import { GamificationContext, type GamificationContextValue } from './gamification-context'
import { useAuth } from './useAuth'
import type {
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
import type { BrandIdentity } from '../types/brand-identity'
import { buildBrandAiContext } from '../utils/brand-identity'

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
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestStateRef = useRef(state)
  latestStateRef.current = state

  const flushPersist = useCallback(
    (nextState: UserGamificationState = latestStateRef.current) => {
      if (!userId) {
        return
      }

      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }

      void getGamificationPersistence()
        .save(userId, toPersistedGamificationState(nextState), {
          email: currentUser?.email,
        })
        .catch(() => {
          // Falha de rede não quebra a UI; cache local cobre leitura offline.
        })
    },
    [userId, currentUser?.email],
  )

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
        // Firestore (users/{uid}.gamification) → fallback AsyncStorage cache
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

    // Debounce para edições contínuas (perfil/brand); recompensas fazem flush imediato.
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
    }

    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      flushPersist(state)
    }, PERSIST_DEBOUNCE_MS)

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }
    }
  }, [state, userId, isHydrated, flushPersist])

  const applyOptimisticUpdate = useCallback(
    (updater: (current: UserGamificationState) => UserGamificationState, options?: { flush?: boolean }) => {
      setState((current) => {
        const next = updater(current)
        latestStateRef.current = next

        if (options?.flush) {
          // Optimistic UI: estado já atualizado; sync Firestore em background agora.
          queueMicrotask(() => flushPersist(next))
        }

        return next
      })
    },
    [flushPersist],
  )

  const addXp = useCallback(
    (amount: number) => {
      applyOptimisticUpdate((current) => applyXpReward(current, amount), { flush: true })
    },
    [applyOptimisticUpdate],
  )

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

      applyOptimisticUpdate((current) => {
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
      }, { flush: true })
    },
    [applyOptimisticUpdate],
  )

  const incrementCompletedActions = useCallback(
    (amount = 1) => {
      if (amount <= 0) {
        return
      }

      applyOptimisticUpdate((current) => ({
        ...current,
        completedActions: current.completedActions + amount,
      }))
    },
    [applyOptimisticUpdate],
  )

  const incrementInfluencePoints = useCallback(
    (amount: number) => {
      if (amount <= 0) {
        return
      }

      applyOptimisticUpdate((current) => ({
        ...current,
        influencePoints: current.influencePoints + amount,
      }))
    },
    [applyOptimisticUpdate],
  )

  const updateStreak = useCallback(
    (days: number) => {
      if (days < 0) {
        return
      }

      applyOptimisticUpdate((current) => ({
        ...current,
        streakDays: days,
      }))
    },
    [applyOptimisticUpdate],
  )

  const setUserProfile = useCallback(
    (profile: UserProfile) => {
      applyOptimisticUpdate((current) => ({
        ...current,
        userProfile: profile,
      }), { flush: true })
    },
    [applyOptimisticUpdate],
  )

  const setBrandIdentity = useCallback(
    (identity: BrandIdentity) => {
      applyOptimisticUpdate((current) => ({
        ...current,
        brandIdentity: identity,
      }), { flush: true })
    },
    [applyOptimisticUpdate],
  )

  const setCompanyStage = useCallback(
    (stage: UserGamificationState['companyStage']) => {
      applyOptimisticUpdate((current) => ({
        ...current,
        companyStage: stage,
      }))
    },
    [applyOptimisticUpdate],
  )

  const executeAction = useCallback(
    (actionId: string) => {
      const action = GROWTH_ACTIONS[actionId] ?? {
        ...DEFAULT_GROWTH_ACTION,
        title: `${DEFAULT_GROWTH_ACTION.title} (${actionId})`,
      }

      applyOptimisticUpdate((current) => {
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
      }, { flush: true })
    },
    [applyOptimisticUpdate],
  )

  const contextValue = useMemo<GamificationContextValue>(() => {
    const { currentXp, nextLevelXp } = state.economy
    const xpProgress = resolveXpProgress(currentXp, nextLevelXp)
    const xpRemaining = Math.max(0, nextLevelXp - currentXp)
    const brandAiContext = state.brandIdentity
      ? buildBrandAiContext(state.brandIdentity, state.userProfile)
      : null

    return {
      ...state,
      currentXp,
      maxXp: nextLevelXp,
      xpProgress,
      xpRemaining,
      isHydrated,
      isOnboardingComplete: state.userProfile !== null && state.brandIdentity !== null,
      brandAiContext,
      addXp,
      completeMission,
      executeAction,
      setUserProfile,
      setBrandIdentity,
      setCompanyStage,
      incrementCompletedActions,
      incrementInfluencePoints,
      updateStreak,
    }
  }, [
    state,
    isHydrated,
    addXp,
    completeMission,
    executeAction,
    setUserProfile,
    setBrandIdentity,
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
