import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import type { Client } from '@shared/types'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import { scopedDocId } from '@shared/utils/scoped-doc-id'

function normalizeClient(id: string, data: Partial<Client>): Client | null {
  if (!data.userId || !data.name) {
    return null
  }

  return {
    id: data.id ?? id,
    userId: data.userId,
    name: data.name,
    company: data.company ?? '—',
    email: data.email ?? '—',
    phone: data.phone,
    status: data.status ?? 'prospecto',
    lastContact: data.lastContact ?? '—',
  }
}

export type FirestoreClientRepository = {
  listByUser(userId: string): Promise<Client[]>
  getClientById(userId: string, id: string): Promise<Client | null>
  upsertClient(client: Client): Promise<void>
}

export function createFirestoreClientRepository(db: Firestore): FirestoreClientRepository {
  const clientsRef = collection(db, firestoreCollections.clients)

  return {
    async listByUser(userId) {
      const snapshot = await getDocs(query(clientsRef, where('userId', '==', userId)))
      return snapshot.docs
        .map((document) => normalizeClient(document.id, document.data() as Partial<Client>))
        .filter((client): client is Client => client !== null)
    },

    async getClientById(userId, id) {
      const document = await getDoc(doc(db, firestoreCollections.clients, scopedDocId(userId, id)))
      if (!document.exists()) {
        return null
      }

      return normalizeClient(document.id, document.data() as Partial<Client>)
    },

    async upsertClient(client) {
      await setDoc(
        doc(db, firestoreCollections.clients, scopedDocId(client.userId, client.id)),
        client as DocumentData,
        { merge: true },
      )
    },
  }
}
