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
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { InboxConversation, InboxMessage } from '@shared/types'

type ConversationDocument = Omit<InboxConversation, 'messages'>

export type FirestoreInboxRepository = {
  listByUser(userId: string): Promise<InboxConversation[]>
  upsertConversation(conversation: ConversationDocument): Promise<void>
  upsertMessage(conversationId: string, message: InboxMessage): Promise<void>
}

export function createFirestoreInboxRepository(db: Firestore): FirestoreInboxRepository {
  const conversationsRef = collection(db, firestoreCollections.conversations)

  return {
    async listByUser(userId) {
      const snapshot = await getDocs(
        query(conversationsRef, where('userId', '==', userId)),
      )

      const conversations = await Promise.all(
        snapshot.docs.map(async (document) => {
          const data = document.data() as ConversationDocument
          const messagesRef = collection(
            db,
            firestoreCollections.conversations,
            document.id,
            'messages',
          )
          const messagesSnapshot = await getDocs(messagesRef)
          const messages = messagesSnapshot.docs
            .map((messageDoc) => messageDoc.data() as InboxMessage)
            .sort((left, right) => left.timestamp.localeCompare(right.timestamp))

          return {
            ...data,
            id: data.id ?? document.id,
            messages,
          }
        }),
      )

      return conversations.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    },

    async upsertConversation(conversation) {
      await setDoc(
        doc(db, firestoreCollections.conversations, conversation.id),
        conversation as DocumentData,
        { merge: true },
      )
    },

    async upsertMessage(conversationId, message) {
      await setDoc(
        doc(
          db,
          firestoreCollections.conversations,
          conversationId,
          'messages',
          message.id,
        ),
        message as DocumentData,
        { merge: true },
      )
    },
  }
}
