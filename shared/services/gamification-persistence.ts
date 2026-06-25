import type { PersistedGamificationState } from '../constants/initial-gamification-state'

export type GamificationPersistence = {
  load: (userId: string) => Promise<PersistedGamificationState | null>
  save: (
    userId: string,
    state: PersistedGamificationState,
    meta?: { email?: string },
  ) => Promise<void>
}

let gamificationPersistence: GamificationPersistence | null = null

export function configureGamificationPersistence(persistence: GamificationPersistence) {
  gamificationPersistence = persistence
}

export function getGamificationPersistence(): GamificationPersistence {
  if (!gamificationPersistence) {
    throw new Error(
      'Gamification persistence not configured. Call configureGamificationPersistence() at app bootstrap.',
    )
  }

  return gamificationPersistence
}
