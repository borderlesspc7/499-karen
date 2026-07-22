import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import type { KanbanCard, KanbanColumn } from '@shared/types'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import { scopedDocId } from '@shared/utils/scoped-doc-id'
import { omitUndefinedFields } from './firestore-sanitize'

function normalizeColumn(id: string, data: Partial<KanbanColumn>): KanbanColumn | null {
  if (!data.userId || !data.title) {
    return null
  }

  return {
    id: data.id ?? id,
    userId: data.userId,
    title: data.title,
    order: data.order ?? 0,
  }
}

function normalizeCard(id: string, data: Partial<KanbanCard>): KanbanCard | null {
  if (!data.userId || !data.title || !data.columnId) {
    return null
  }

  const now = new Date().toISOString()

  return {
    id: data.id ?? id,
    userId: data.userId,
    title: data.title,
    description: data.description ?? '',
    category: data.category ?? 'vendas',
    priority: data.priority ?? 'media',
    clientId: data.clientId,
    clientName: data.clientName ?? '—',
    dueDate: data.dueDate ?? '—',
    columnId: data.columnId,
    order: data.order ?? 0,
    dealValue: typeof data.dealValue === 'number' ? data.dealValue : 0,
    source: data.source ?? 'manual',
    campaignId: data.campaignId,
    externalLeadId: data.externalLeadId,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  }
}

export type FirestoreCrmRepository = {
  listColumns(userId: string): Promise<KanbanColumn[]>
  listCards(userId: string): Promise<KanbanCard[]>
  upsertColumn(column: KanbanColumn): Promise<void>
  upsertCard(card: KanbanCard): Promise<void>
  getCardById(userId: string, id: string): Promise<KanbanCard | null>
  deleteCard(userId: string, id: string): Promise<void>
}

export function createFirestoreCrmRepository(db: Firestore): FirestoreCrmRepository {
  const columnsRef = collection(db, firestoreCollections.kanbanColumns)
  const cardsRef = collection(db, firestoreCollections.opportunities)

  return {
    async listColumns(userId) {
      const snapshot = await getDocs(query(columnsRef, where('userId', '==', userId)))
      return snapshot.docs
        .map((document) => normalizeColumn(document.id, document.data() as Partial<KanbanColumn>))
        .filter((column): column is KanbanColumn => column !== null)
        .sort((left, right) => left.order - right.order)
    },

    async listCards(userId) {
      const snapshot = await getDocs(query(cardsRef, where('userId', '==', userId)))
      return snapshot.docs
        .map((document) => normalizeCard(document.id, document.data() as Partial<KanbanCard>))
        .filter((card): card is KanbanCard => card !== null)
    },

    async getCardById(userId, id) {
      const document = await getDoc(
        doc(db, firestoreCollections.opportunities, scopedDocId(userId, id)),
      )
      if (!document.exists()) {
        return null
      }

      return normalizeCard(document.id, document.data() as Partial<KanbanCard>)
    },

    async upsertColumn(column) {
      await setDoc(
        doc(db, firestoreCollections.kanbanColumns, scopedDocId(column.userId, column.id)),
        omitUndefinedFields(column as Record<string, unknown>) as DocumentData,
        { merge: true },
      )
    },

    async upsertCard(card) {
      await setDoc(
        doc(db, firestoreCollections.opportunities, scopedDocId(card.userId, card.id)),
        omitUndefinedFields(card as Record<string, unknown>) as DocumentData,
        { merge: true },
      )
    },

    async deleteCard(userId, id) {
      await deleteDoc(doc(db, firestoreCollections.opportunities, scopedDocId(userId, id)))
    },
  }
}
