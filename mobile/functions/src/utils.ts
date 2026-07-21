import * as admin from 'firebase-admin'
import { createHmac, randomBytes } from 'crypto'

if (!admin.apps.length) {
  admin.initializeApp()
}

export const db = admin.firestore()

export type MessagingChannel = 'whatsapp' | 'instagram' | 'facebook' | 'linkedin'

export type ChannelSecret = {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  pageAccessToken?: string
  pageId?: string
  phoneNumberId?: string
  wabaId?: string
  instagramAccountId?: string
  linkedinMemberId?: string
}

export function generateId(): string {
  return randomBytes(12).toString('hex')
}

export function signOAuthState(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function buildOAuthState(userId: string, channel: MessagingChannel, secret: string): string {
  const nonce = generateId()
  const payload = `${userId}:${channel}:${nonce}:${Date.now()}`
  const signature = signOAuthState(payload, secret)
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

export function parseOAuthState(
  state: string,
  secret: string,
): { userId: string; channel: MessagingChannel } | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 5) {
      return null
    }

    const [userId, channel, , , signature] = parts
    const payload = parts.slice(0, 4).join(':')
    const expected = signOAuthState(payload, secret)

    if (signature !== expected) {
      return null
    }

    if (!['whatsapp', 'instagram', 'facebook', 'linkedin'].includes(channel)) {
      return null
    }

    return { userId, channel: channel as MessagingChannel }
  } catch {
    return null
  }
}

export async function saveChannelSecret(
  userId: string,
  channel: MessagingChannel,
  secret: ChannelSecret,
): Promise<void> {
  await db
    .collection('integration_secrets')
    .doc(userId)
    .collection('channels')
    .doc(channel)
    .set(
      {
        ...secret,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
}

export async function getChannelSecret(
  userId: string,
  channel: MessagingChannel,
): Promise<ChannelSecret | null> {
  const document = await db
    .collection('integration_secrets')
    .doc(userId)
    .collection('channels')
    .doc(channel)
    .get()

  if (!document.exists) {
    return null
  }

  return document.data() as ChannelSecret
}

export async function saveChannelConnection(
  userId: string,
  channel: MessagingChannel,
  data: Record<string, unknown>,
): Promise<void> {
  await db
    .collection('channel_connections')
    .doc(userId)
    .collection('channels')
    .doc(channel)
    .set(
      {
        channel,
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
}

export async function findUserIdByPageId(pageId: string): Promise<string | null> {
  const snapshot = await db
    .collectionGroup('channels')
    .where('pageId', '==', pageId)
    .where('status', '==', 'connected')
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].ref.parent.parent?.id ?? null
}

export async function findUserIdByPhoneNumberId(phoneNumberId: string): Promise<string | null> {
  const snapshot = await db
    .collectionGroup('channels')
    .where('phoneNumberId', '==', phoneNumberId)
    .where('status', '==', 'connected')
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].ref.parent.parent?.id ?? null
}

export function formatTimestamp(date = new Date()): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export async function upsertInboundMessage(input: {
  userId: string
  channel: MessagingChannel
  externalThreadId: string
  externalContactId: string
  contactName: string
  messageText: string
  externalMessageId: string
  preview?: string
}): Promise<void> {
  const conversationId = `${input.channel}-${input.externalThreadId}`
  const conversationRef = db.collection('conversations').doc(conversationId)
  const conversationDoc = await conversationRef.get()
  const now = formatTimestamp()

  if (!conversationDoc.exists) {
    await conversationRef.set({
      id: conversationId,
      userId: input.userId,
      contactName: input.contactName,
      company: '—',
      preview: input.preview ?? input.messageText,
      channel: input.channel,
      status: 'online',
      unreadCount: 1,
      updatedAt: now,
      priority: 'warm',
      aiSummary: `Nova mensagem via ${input.channel}`,
      estimatedValue: 0,
      externalThreadId: input.externalThreadId,
      externalContactId: input.externalContactId,
      createdAt: new Date().toISOString(),
    })
  } else {
    await conversationRef.set(
      {
        preview: input.preview ?? input.messageText,
        updatedAt: now,
        unreadCount: admin.firestore.FieldValue.increment(1),
        status: 'online',
      },
      { merge: true },
    )
  }

  await conversationRef.collection('messages').doc(input.externalMessageId).set({
    id: input.externalMessageId,
    role: 'contact',
    text: input.messageText,
    timestamp: now,
    externalMessageId: input.externalMessageId,
    deliveryStatus: 'delivered',
    createdAt: new Date().toISOString(),
  })
}
