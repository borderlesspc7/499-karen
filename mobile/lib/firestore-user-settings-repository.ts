import { doc, getDoc, setDoc, type DocumentData, type Firestore } from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import {
  DEFAULT_INTEGRATIONS,
  type TeamMember,
  type UserIntegrations,
  type UserSettings,
} from '@shared/types'

type UserSettingsDocument = {
  integrations?: Partial<UserIntegrations>
  teamMembers?: TeamMember[]
}

function normalizeSettings(data: UserSettingsDocument | undefined): UserSettings {
  return {
    integrations: {
      ...DEFAULT_INTEGRATIONS,
      ...(data?.integrations ?? {}),
    },
    teamMembers: data?.teamMembers ?? [],
  }
}

export type FirestoreUserSettingsRepository = {
  load(userId: string): Promise<UserSettings>
  saveIntegrations(userId: string, integrations: UserIntegrations): Promise<void>
  saveTeamMembers(userId: string, teamMembers: TeamMember[]): Promise<void>
}

export function createFirestoreUserSettingsRepository(
  db: Firestore,
): FirestoreUserSettingsRepository {
  return {
    async load(userId) {
      const document = await getDoc(doc(db, firestoreCollections.users, userId))
      if (!document.exists()) {
        return { integrations: { ...DEFAULT_INTEGRATIONS }, teamMembers: [] }
      }

      return normalizeSettings(document.data() as UserSettingsDocument)
    },

    async saveIntegrations(userId, integrations) {
      await setDoc(
        doc(db, firestoreCollections.users, userId),
        { integrations, updatedAt: new Date().toISOString() } as DocumentData,
        { merge: true },
      )
    },

    async saveTeamMembers(userId, teamMembers) {
      await setDoc(
        doc(db, firestoreCollections.users, userId),
        { teamMembers, updatedAt: new Date().toISOString() } as DocumentData,
        { merge: true },
      )
    },
  }
}
