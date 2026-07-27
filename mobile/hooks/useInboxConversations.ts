import { useEffect, useState } from 'react'
import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { useAuth } from '@shared/contexts'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { InboxConversation } from '@shared/types'
import { getFirestoreDb } from '@/lib/firebase'
import { FIRESTORE_PAGE_LIMITS } from '@/lib/firestore-limits'

/**
 * Lista conversas em tempo real sem carregar subcoleções de mensagens (evita N+1).
 */
export function useInboxConversations() {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState<InboxConversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser?.id) {
      setConversations([])
      setIsLoading(false)
      return
    }

    let unsubscribe: Unsubscribe | null = null
    let isMounted = true
    const userId = currentUser.id
    const db = getFirestoreDb()
    const conversationsQuery = query(
      collection(db, firestoreCollections.conversations),
      where('userId', '==', userId),
      limit(FIRESTORE_PAGE_LIMITS.conversations),
    )

    setIsLoading(true)
    setError(null)

    unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const nextConversations = snapshot.docs.map((document) => {
          const data = document.data() as Omit<InboxConversation, 'messages'>
          return {
            ...data,
            id: data.id ?? document.id,
            messages: [],
          }
        })

        nextConversations.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

        if (isMounted) {
          setConversations(nextConversations)
          setIsLoading(false)
        }
      },
      (snapshotError) => {
        if (!isMounted) {
          return
        }
        setError(snapshotError.message)
        setIsLoading(false)
      },
    )

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [currentUser?.id])

  return { conversations, isLoading, error }
}
