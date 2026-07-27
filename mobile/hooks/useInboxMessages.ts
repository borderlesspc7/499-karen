import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { InboxMessage } from '@shared/types'
import { getFirestoreDb } from '@/lib/firebase'
import { FIRESTORE_PAGE_LIMITS } from '@/lib/firestore-limits'

function sortMessages(messages: InboxMessage[]): InboxMessage[] {
  return [...messages].sort((left, right) => {
    const leftTime = left.createdAt ?? left.timestamp
    const rightTime = right.createdAt ?? right.timestamp
    return String(leftTime).localeCompare(String(rightTime))
  })
}

/**
 * Carrega apenas as mensagens da conversa selecionada (últimas N), em tempo real.
 */
export function useInboxMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(conversationId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setIsLoading(false)
      setError(null)
      return
    }

    let unsubscribe: Unsubscribe | null = null
    let isMounted = true
    const db = getFirestoreDb()
    const messagesRef = collection(
      db,
      firestoreCollections.conversations,
      conversationId,
      'messages',
    )

    setIsLoading(true)
    setError(null)
    setMessages([])

    async function loadLegacyMessages() {
      const fallbackSnapshot = await getDocs(
        query(messagesRef, limit(FIRESTORE_PAGE_LIMITS.messages)),
      )
      if (!isMounted) {
        return
      }
      setMessages(
        sortMessages(fallbackSnapshot.docs.map((document) => document.data() as InboxMessage)),
      )
      setIsLoading(false)
      setError(null)
    }

    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      limitToLast(FIRESTORE_PAGE_LIMITS.messages),
    )

    unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const nextMessages = snapshot.docs.map((document) => document.data() as InboxMessage)
        if (isMounted) {
          setMessages(nextMessages)
          setIsLoading(false)
          setError(null)
        }
      },
      (snapshotError) => {
        void loadLegacyMessages().catch(() => {
          if (isMounted) {
            setError(snapshotError.message)
            setIsLoading(false)
          }
        })
      },
    )

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [conversationId])

  return { messages, isLoading, error }
}
