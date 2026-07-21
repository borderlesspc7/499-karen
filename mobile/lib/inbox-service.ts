import { collection, getDocs } from 'firebase/firestore'
import { initialInboxConversations } from '@shared/data/initial-inbox'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { InboxConversation } from '@shared/types'
import { getFirestoreDb } from './firebase'
import { getInboxRepository } from './repositories'

async function hasConnectedChannels(userId: string): Promise<boolean> {
  const snapshot = await getDocs(
    collection(getFirestoreDb(), firestoreCollections.channelConnections, userId, 'channels'),
  )

  return snapshot.docs.some((document) => document.data().status === 'connected')
}

export async function ensureInboxLoaded(userId: string): Promise<void> {
  const repository = getInboxRepository()
  const conversations = await repository.listByUser(userId)

  if (conversations.length > 0) {
    return
  }

  const hasConnections = await hasConnectedChannels(userId)
  if (hasConnections) {
    return
  }

  await seedInboxConversations(userId)
}

export async function loadInboxConversations(userId: string): Promise<InboxConversation[]> {
  await ensureInboxLoaded(userId)
  return getInboxRepository().listByUser(userId)
}

export async function seedInboxConversations(userId: string): Promise<void> {
  const repository = getInboxRepository()

  await Promise.all(
    initialInboxConversations.map(async (seed) => {
      const { messages, ...conversation } = seed

      await repository.upsertConversation({
        ...conversation,
        userId,
      })

      await Promise.all(
        messages.map((message) => repository.upsertMessage(conversation.id, message)),
      )
    }),
  )
}

export async function syncInboxFromClients(
  userId: string,
  clients: Array<{ id: string; name: string; company: string; status: string }>,
): Promise<void> {
  const repository = getInboxRepository()
  const existing = await repository.listByUser(userId)
  const existingClientIds = new Set(existing.map((conversation) => conversation.clientId))

  const newClients = clients.filter((client) => !existingClientIds.has(client.id))

  await Promise.all(
    newClients.map((client) => {
      const conversationId = `conv-client-${client.id}`
      const preview =
        client.status === 'inativo'
          ? 'Lead inativo — retomar contato?'
          : 'Nova conversa iniciada'

      return repository
        .upsertConversation({
          id: conversationId,
          userId,
          contactName: client.name,
          company: client.company,
          preview,
          channel: 'whatsapp',
          status: 'offline',
          unreadCount: client.status === 'prospecto' ? 1 : 0,
          updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          priority: client.status === 'inativo' ? 'cold' : 'warm',
          aiSummary: `Conversa vinculada ao cliente ${client.name}`,
          estimatedValue: client.status === 'ativo' ? 3600 : 1800,
          clientId: client.id,
        })
        .then(() =>
          repository.upsertMessage(conversationId, {
            id: `msg-${conversationId}-1`,
            role: 'agent',
            text: `Olá ${client.name}, como posso ajudar?`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }),
        )
    }),
  )
}
