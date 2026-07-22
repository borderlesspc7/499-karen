import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import type { Automation } from '@shared/types/automation'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import { generateId } from '@shared/utils/generate-id'
import { scopedDocId } from '@shared/utils/scoped-doc-id'
import { getFirestoreDb } from './firebase'

function normalizeAutomation(id: string, data: Partial<Automation>): Automation | null {
  if (!data.userId || !data.title || !data.trigger || !data.action) {
    return null
  }

  const now = new Date().toISOString()

  return {
    id: data.id ?? id,
    userId: data.userId,
    title: data.title,
    description: data.description ?? '',
    trigger: data.trigger,
    action: data.action,
    enabled: data.enabled ?? true,
    runCount: data.runCount ?? 0,
    lastRunAt: data.lastRunAt ?? null,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  }
}

export type CreateAutomationInput = {
  userId: string
  title: string
  description: string
  trigger: Automation['trigger']
  action: Automation['action']
  enabled?: boolean
}

export type FirestoreAutomationRepository = {
  listByUser(userId: string): Promise<Automation[]>
  upsert(automation: Automation): Promise<void>
  create(input: CreateAutomationInput): Promise<Automation>
  setEnabled(userId: string, automationId: string, enabled: boolean): Promise<void>
}

export function createFirestoreAutomationRepository(
  db: Firestore = getFirestoreDb(),
): FirestoreAutomationRepository {
  const automationsRef = collection(db, firestoreCollections.automations)

  return {
    async listByUser(userId) {
      const snapshot = await getDocs(query(automationsRef, where('userId', '==', userId)))
      return snapshot.docs
        .map((document) =>
          normalizeAutomation(document.id, document.data() as Partial<Automation>),
        )
        .filter((automation): automation is Automation => automation !== null)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },

    async upsert(automation) {
      await setDoc(
        doc(db, firestoreCollections.automations, scopedDocId(automation.userId, automation.id)),
        automation as DocumentData,
        { merge: true },
      )
    },

    async create(input) {
      const now = new Date().toISOString()
      const automation: Automation = {
        id: generateId(),
        userId: input.userId,
        title: input.title,
        description: input.description,
        trigger: input.trigger,
        action: input.action,
        enabled: input.enabled ?? true,
        runCount: 0,
        lastRunAt: null,
        createdAt: now,
        updatedAt: now,
      }

      await this.upsert(automation)
      return automation
    },

    async setEnabled(userId, automationId, enabled) {
      const now = new Date().toISOString()
      await setDoc(
        doc(db, firestoreCollections.automations, scopedDocId(userId, automationId)),
        { enabled, updatedAt: now } as DocumentData,
        { merge: true },
      )
    },
  }
}

let automationRepository: FirestoreAutomationRepository | null = null

export function getAutomationRepository() {
  if (!automationRepository) {
    automationRepository = createFirestoreAutomationRepository()
  }

  return automationRepository
}
