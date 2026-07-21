import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { useAuth } from '@shared/contexts'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { InboxConversation, InboxMessage } from '@shared/types'
import { getFirestoreDb } from '@/lib/firebase'
import { ensureInboxLoaded } from '@/lib/inbox-service'

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

    async function bootstrap() {
      setIsLoading(true)
      setError(null)

      try {
        await ensureInboxLoaded(userId)
      } catch (loadError) {
        if (!isMounted) {
          return
        }
        const message =
          loadError instanceof Error ? loadError.message : 'Não foi possível carregar o inbox.'
        setError(message)
        setIsLoading(false)
        return
      }

      const db = getFirestoreDb()
      const conversationsQuery = query(
        collection(db, firestoreCollections.conversations),
        where('userId', '==', userId),
      )

      unsubscribe = onSnapshot(
        conversationsQuery,
        async (snapshot) => {
          const nextConversations = await Promise.all(
            snapshot.docs.map(async (document) => {
              const data = document.data() as Omit<InboxConversation, 'messages'>
              const messagesSnapshot = await getDocs(
                collection(db, firestoreCollections.conversations, document.id, 'messages'),
              )

              const messages = messagesSnapshot.docs
                .map((messageDoc) => messageDoc.data() as InboxMessage)
                .sort((left, right) => {
                  const leftTime = left.createdAt ?? left.timestamp
                  const rightTime = right.createdAt ?? right.timestamp
                  return String(leftTime).localeCompare(String(rightTime))
                })

              return {
                ...data,
                id: data.id ?? document.id,
                messages,
              }
            }),
          )

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
    }

    void bootstrap()

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [currentUser?.id])

  return { conversations, isLoading, error }
}
