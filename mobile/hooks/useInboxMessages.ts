import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  collection,
  documentId,
  endBefore,
  getDocs,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
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

function mergeMessages(...messageGroups: InboxMessage[][]): InboxMessage[] {
  const messagesById = new Map<string, InboxMessage>()

  messageGroups.forEach((messages) => {
    messages.forEach((message) => {
      messagesById.set(message.id, message)
    })
  })

  return sortMessages([...messagesById.values()])
}

function mapMessageDocument(document: QueryDocumentSnapshot<DocumentData>): InboxMessage {
  const message = document.data() as InboxMessage
  return { ...message, id: message.id ?? document.id }
}

export type InboxMessageReadMetrics = {
  initialReads: number
  olderReads: number
  realtimeReads: number
}

const INITIAL_READ_METRICS: InboxMessageReadMetrics = {
  initialReads: 0,
  olderReads: 0,
  realtimeReads: 0,
}

export function useInboxMessages(conversationId: string | null) {
  const [latestMessages, setLatestMessages] = useState<InboxMessage[]>([])
  const [olderMessages, setOlderMessages] = useState<InboxMessage[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(conversationId))
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(Boolean(conversationId))
  const [error, setError] = useState<string | null>(null)
  const [readMetrics, setReadMetrics] =
    useState<InboxMessageReadMetrics>(INITIAL_READ_METRICS)
  const activeConversationIdRef = useRef(conversationId)
  const oldestDocumentRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const hasReceivedInitialSnapshotRef = useRef(false)
  const isLoadingOlderRef = useRef(false)

  const messages = useMemo(
    () => mergeMessages(olderMessages, latestMessages),
    [latestMessages, olderMessages],
  )

  useEffect(() => {
    activeConversationIdRef.current = conversationId
    oldestDocumentRef.current = null
    hasReceivedInitialSnapshotRef.current = false
    isLoadingOlderRef.current = false
    setLatestMessages([])
    setOlderMessages([])
    setIsLoadingOlder(false)
    setHasMore(Boolean(conversationId))
    setReadMetrics(INITIAL_READ_METRICS)

    if (!conversationId) {
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

    async function loadLegacyMessages() {
      const fallbackSnapshot = await getDocs(
        query(
          messagesRef,
          orderBy(documentId(), 'asc'),
          limitToLast(FIRESTORE_PAGE_LIMITS.messages),
        ),
      )
      if (!isMounted) {
        return
      }
      setLatestMessages(sortMessages(fallbackSnapshot.docs.map(mapMessageDocument)))
      setReadMetrics({
        initialReads: fallbackSnapshot.size,
        olderReads: 0,
        realtimeReads: 0,
      })
      setHasMore(false)
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
        if (!isMounted) {
          return
        }

        const isInitialSnapshot = !hasReceivedInitialSnapshotRef.current
        const nextMessages = snapshot.docs.map(mapMessageDocument)

        if (isInitialSnapshot) {
          hasReceivedInitialSnapshotRef.current = true
          oldestDocumentRef.current = snapshot.docs[0] ?? null
          setHasMore(snapshot.size === FIRESTORE_PAGE_LIMITS.messages)
          setReadMetrics({
            initialReads: snapshot.size,
            olderReads: 0,
            realtimeReads: 0,
          })
        } else {
          setReadMetrics((current) => ({
            ...current,
            realtimeReads: current.realtimeReads + snapshot.docChanges().length,
          }))
        }

        setLatestMessages(nextMessages)
        setIsLoading(false)
        setError(null)
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

  const loadOlderMessages = useCallback(async () => {
    const oldestDocument = oldestDocumentRef.current

    if (
      !conversationId ||
      !oldestDocument ||
      !hasMore ||
      isLoadingOlderRef.current
    ) {
      return
    }

    isLoadingOlderRef.current = true
    setIsLoadingOlder(true)
    setError(null)

    const db = getFirestoreDb()
    const messagesRef = collection(
      db,
      firestoreCollections.conversations,
      conversationId,
      'messages',
    )

    try {
      const snapshot = await getDocs(
        query(
          messagesRef,
          orderBy('createdAt', 'asc'),
          endBefore(oldestDocument),
          limitToLast(FIRESTORE_PAGE_LIMITS.messages),
        ),
      )

      if (activeConversationIdRef.current !== conversationId) {
        return
      }

      const nextOlderMessages = snapshot.docs.map(mapMessageDocument)
      setOlderMessages((current) => mergeMessages(nextOlderMessages, current))
      setReadMetrics((current) => ({
        ...current,
        olderReads: current.olderReads + snapshot.size,
      }))
      setHasMore(snapshot.size === FIRESTORE_PAGE_LIMITS.messages)

      if (snapshot.docs.length > 0) {
        oldestDocumentRef.current = snapshot.docs[0]
      }
    } catch {
      if (activeConversationIdRef.current === conversationId) {
        setHasMore(false)
      }
    } finally {
      if (activeConversationIdRef.current === conversationId) {
        isLoadingOlderRef.current = false
        setIsLoadingOlder(false)
      }
    }
  }, [conversationId, hasMore])

  return {
    messages,
    loadOlderMessages,
    isLoadingOlder,
    hasMore,
    error,
    isLoading,
    readMetrics,
  }
}
