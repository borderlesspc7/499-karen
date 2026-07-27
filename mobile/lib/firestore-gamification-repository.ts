/**
 * Persistência de gamificação no Firestore.
 *
 * Documento canônico: `users/{uid}/app_state/gamification`
 * Fallback legado: campo `users/{uid}.gamification`
 *
 * Separar do doc raiz evita que saves de XP disparem o listener de assinatura.
 *
 * Fluxo: UI atualiza na hora (optimistic) → repository.save em background
 * com cache AsyncStorage para leitura offline.
 */
import { doc, getDoc, setDoc, type DocumentData, type Firestore } from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import {
  INITIAL_GAMIFICATION_STATE,
  mergeGamificationState,
  toPersistedGamificationState,
  type PersistedGamificationState,
} from '@shared/constants/initial-gamification-state'
import type { GamificationPersistence } from '@shared/services/gamification-persistence'
import { getStorage } from '@shared/storage'
import { getFirestoreDb } from './firebase'

const GAMIFICATION_CACHE_PREFIX = 'borderless_gamification_cache:'
const APP_STATE_COLLECTION = 'app_state'
const GAMIFICATION_DOC_ID = 'gamification'

type UserGamificationDocument = {
  email?: string
  gamification?: PersistedGamificationState
  updatedAt?: string
}

function isPersistedGamificationState(value: unknown): value is PersistedGamificationState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as PersistedGamificationState
  return (
    typeof candidate.level === 'number' &&
    !!candidate.businessHealth &&
    typeof candidate.businessHealth.totalScore === 'number' &&
    !!candidate.economy &&
    typeof candidate.companyTier === 'string'
  )
}

function gamificationDocRef(db: Firestore, userId: string) {
  return doc(
    db,
    firestoreCollections.users,
    userId,
    APP_STATE_COLLECTION,
    GAMIFICATION_DOC_ID,
  )
}

async function readLocalCache(userId: string): Promise<PersistedGamificationState | null> {
  try {
    const raw = await getStorage().getItem(`${GAMIFICATION_CACHE_PREFIX}${userId}`)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as unknown
    return isPersistedGamificationState(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function writeLocalCache(userId: string, state: PersistedGamificationState): Promise<void> {
  try {
    await getStorage().setItem(`${GAMIFICATION_CACHE_PREFIX}${userId}`, JSON.stringify(state))
  } catch {
    // Cache local é best-effort; Firestore é a fonte de verdade.
  }
}

export function createFirestoreGamificationPersistence(db: Firestore = getFirestoreDb()): GamificationPersistence {
  return {
    async load(userId) {
      const cached = await readLocalCache(userId)

      try {
        const subdocument = await getDoc(gamificationDocRef(db, userId))
        if (subdocument.exists()) {
          const data = subdocument.data() as UserGamificationDocument
          if (isPersistedGamificationState(data.gamification)) {
            await writeLocalCache(userId, data.gamification)
            return data.gamification
          }
        }

        // Migração lazy: dados antigos no doc raiz do usuário.
        const legacyDocument = await getDoc(doc(db, firestoreCollections.users, userId))
        if (!legacyDocument.exists()) {
          return cached
        }

        const legacyData = legacyDocument.data() as UserGamificationDocument
        if (!isPersistedGamificationState(legacyData.gamification)) {
          return cached
        }

        await writeLocalCache(userId, legacyData.gamification)
        await setDoc(
          gamificationDocRef(db, userId),
          {
            email: legacyData.email,
            gamification: legacyData.gamification,
            updatedAt: new Date().toISOString(),
          } as DocumentData,
          { merge: true },
        )

        return legacyData.gamification
      } catch {
        return cached
      }
    },

    async save(userId, state, meta) {
      const payload: UserGamificationDocument = {
        email: meta?.email,
        gamification: state,
        updatedAt: new Date().toISOString(),
      }

      await writeLocalCache(userId, state)

      await setDoc(gamificationDocRef(db, userId), payload as DocumentData, {
        merge: true,
      })
    },
  }
}

export function createDefaultGamificationStateForNewUser(): PersistedGamificationState {
  return toPersistedGamificationState(INITIAL_GAMIFICATION_STATE)
}

export function hydrateGamificationFromPersistence(
  persisted: PersistedGamificationState | null,
): ReturnType<typeof mergeGamificationState> {
  if (!persisted) {
    return INITIAL_GAMIFICATION_STATE
  }

  return mergeGamificationState(persisted)
}
