import { httpsCallable } from 'firebase/functions'
import type {
  ChannelConnectionsSnapshot,
  MessagingChannel,
} from '@shared/types'
import { getFirebaseFunctions } from './firebase-functions'

type StartOAuthResponse = {
  authUrl: string
  redirectUri: string
}

type SendMessageResponse = {
  messageId: string
  externalMessageId?: string
  deliveryStatus: string
}

export async function startChannelOAuth(channel: MessagingChannel): Promise<StartOAuthResponse> {
  const callable = httpsCallable<{ channel: MessagingChannel }, StartOAuthResponse>(
    getFirebaseFunctions(),
    'startChannelOAuth',
  )
  const result = await callable({ channel })
  return result.data
}

export async function fetchChannelConnections(): Promise<ChannelConnectionsSnapshot> {
  const callable = httpsCallable<void, { connections: ChannelConnectionsSnapshot }>(
    getFirebaseFunctions(),
    'getChannelConnections',
  )
  const result = await callable()
  return result.data.connections
}

export async function disconnectChannelConnection(channel: MessagingChannel): Promise<void> {
  const callable = httpsCallable<{ channel: MessagingChannel }, { success: boolean }>(
    getFirebaseFunctions(),
    'disconnectChannel',
  )
  await callable({ channel })
}

export async function sendInboxMessage(
  conversationId: string,
  text: string,
): Promise<SendMessageResponse> {
  const callable = httpsCallable<{ conversationId: string; text: string }, SendMessageResponse>(
    getFirebaseFunctions(),
    'sendInboxMessage',
  )
  const result = await callable({ conversationId, text })
  return result.data
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const callable = httpsCallable<{ conversationId: string }, { success: boolean }>(
    getFirebaseFunctions(),
    'markConversationRead',
  )
  await callable({ conversationId })
}
