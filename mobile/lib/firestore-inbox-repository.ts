import {
  collection,
  doc,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { InboxConversation, InboxMessage } from '@shared/types'
import { FIRESTORE_PAGE_LIMITS, type ListQueryOptions } from './firestore-limits'

type ConversationDocument = Omit<InboxConversation, 'messages'>

export type ListMessagesOptions = ListQueryOptions & {
  /** Quando true, retorna as últimas N mensagens (ordem cronológica ascendente). */
  latest?: boolean
}

export type FirestoreInboxRepository = {
  listByUser(userId: string, options?: ListQueryOptions): Promise<InboxConversation[]>
  listMessages(conversationId: string, options?: ListMessagesOptions): Promise<InboxMessage[]>
  upsertConversation(conversation: ConversationDocument): Promise<void>
  upsertMessage(conversationId: string, message: InboxMessage): Promise<void>
}

function sortMessages(messages: InboxMessage[]): InboxMessage[] {
  return [...messages].sort((left, right) => {
    const leftTime = left.createdAt ?? left.timestamp
    const rightTime = right.createdAt ?? right.timestamp
    return String(leftTime).localeCompare(String(rightTime))
  })
}

export function createFirestoreInboxRepository(db: Firestore): FirestoreInboxRepository {
  const conversationsRef = collection(db, firestoreCollections.conversations)

  return {
    async listByUser(userId, options = {}) {
      const pageSize = options.limit ?? FIRESTORE_PAGE_LIMITS.conversations
      const snapshot = await getDocs(
        query(conversationsRef, where('userId', '==', userId), limit(pageSize)),
      )

      const conversations = snapshot.docs.map((document) => {
        const data = document.data() as ConversationDocument
        return {
          ...data,
          id: data.id ?? document.id,
          messages: [] as InboxMessage[],
        }
      })

      return conversations.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    },

    async listMessages(conversationId, options = {}) {
      const pageSize = options.limit ?? FIRESTORE_PAGE_LIMITS.messages
      const messagesRef = collection(
        db,
        firestoreCollections.conversations,
        conversationId,
        'messages',
      )

      const constraints: QueryConstraint[] =
        options.latest === false
          ? [orderBy('createdAt', 'asc'), limit(pageSize)]
          : [orderBy('createdAt', 'asc'), limitToLast(pageSize)]

      try {
        const snapshot = await getDocs(query(messagesRef, ...constraints))
        return snapshot.docs.map((messageDoc) => messageDoc.data() as InboxMessage)
      } catch {
        // Fallback para documentos legados sem createdAt indexável.
        const snapshot = await getDocs(query(messagesRef, limit(pageSize)))
        return sortMessages(
          snapshot.docs.map((messageDoc) => messageDoc.data() as InboxMessage),
        ).slice(-pageSize)
      }
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
