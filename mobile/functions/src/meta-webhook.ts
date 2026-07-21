import { createHmac } from 'crypto'
import { onRequest } from 'firebase-functions/v2/https'
import { metaAppSecret, metaWebhookVerifyToken } from './config'
import {
  findUserIdByPageId,
  findUserIdByPhoneNumberId,
  upsertInboundMessage,
} from './utils'

function verifyMetaSignature(rawBody: Buffer, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader?.startsWith('sha256=')) {
    return false
  }

  const expected = createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')

  return signatureHeader.slice(7) === expected
}

export const metaWebhook = onRequest(
  {
    secrets: [metaAppSecret, metaWebhookVerifyToken],
    cors: false,
  },
  async (request, response) => {
    if (request.method === 'GET') {
      const mode = request.query['hub.mode']
      const token = request.query['hub.verify_token']
      const challenge = request.query['hub.challenge']

      if (mode === 'subscribe' && token === metaWebhookVerifyToken.value()) {
        response.status(200).send(challenge)
        return
      }

      response.status(403).send('Forbidden')
      return
    }

    const rawBody = request.rawBody
    const signature = request.get('X-Hub-Signature-256')

    if (!verifyMetaSignature(rawBody, signature, metaAppSecret.value())) {
      response.status(401).send('Invalid signature')
      return
    }

    const body = request.body as {
      object?: string
      entry?: Array<{
        id?: string
        changes?: Array<{
          field?: string
          value?: {
            messaging_product?: string
            metadata?: { phone_number_id?: string; display_phone_number?: string }
            contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
            messages?: Array<{
              id: string
              from: string
              timestamp: string
              type: string
              text?: { body?: string }
            }>
          }
        }>
        messaging?: Array<{
          sender?: { id: string; name?: string }
          recipient?: { id: string }
          message?: { mid: string; text?: string }
        }>
      }>
    }

    try {
      if (body.object === 'whatsapp_business_account') {
        await handleWhatsAppWebhook(body)
      } else if (body.object === 'page') {
        await handleMessengerWebhook(body, 'facebook')
      } else if (body.object === 'instagram') {
        await handleInstagramWebhook(body.entry as Parameters<typeof handleInstagramWebhook>[0])
      }
    } catch (error) {
      console.error('[metaWebhook] processing error', error)
    }

    response.status(200).send('EVENT_RECEIVED')
  },
)

async function handleWhatsAppWebhook(body: {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string }
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
        messages?: Array<{
          id: string
          from: string
          type: string
          text?: { body?: string }
        }>
      }
    }>
  }>
}): Promise<void> {
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      const phoneNumberId = value?.metadata?.phone_number_id
      if (!phoneNumberId) {
        continue
      }

      const userId = await findUserIdByPhoneNumberId(phoneNumberId)
      if (!userId) {
        continue
      }

      for (const message of value.messages ?? []) {
        if (message.type !== 'text' || !message.text?.body) {
          continue
        }

        const contact = value.contacts?.find((item) => item.wa_id === message.from)
        const contactName = contact?.profile?.name ?? message.from

        await upsertInboundMessage({
          userId,
          channel: 'whatsapp',
          externalThreadId: message.from,
          externalContactId: message.from,
          contactName,
          messageText: message.text.body,
          externalMessageId: message.id,
        })
      }
    }
  }
}

async function handleMessengerWebhook(body: {
  entry?: Array<{
    id?: string
    messaging?: Array<{
      sender?: { id: string; name?: string }
      message?: { mid: string; text?: string }
    }>
  }>
}, channel: 'facebook'): Promise<void> {
  for (const entry of body.entry ?? []) {
    const pageId = entry.id
    if (!pageId) {
      continue
    }

    const userId = await findUserIdByPageId(pageId)
    if (!userId) {
      continue
    }

    for (const event of entry.messaging ?? []) {
      const text = event.message?.text
      const messageId = event.message?.mid
      const senderId = event.sender?.id

      if (!text || !messageId || !senderId) {
        continue
      }

      await upsertInboundMessage({
        userId,
        channel,
        externalThreadId: senderId,
        externalContactId: senderId,
        contactName: event.sender?.name ?? `Contato ${senderId.slice(-4)}`,
        messageText: text,
        externalMessageId: messageId,
      })
    }
  }
}

async function handleInstagramWebhook(
  entries: Array<{
    id?: string
    messaging?: Array<{
      sender?: { id: string; name?: string }
      message?: { mid: string; text?: string }
    }>
    changes?: Array<{
      field?: string
      value?: {
        sender?: { id: string }
        message?: { mid: string; text?: string }
      }
    }>
  }> | undefined,
): Promise<void> {
  for (const entry of entries ?? []) {
    const pageId = entry.id
    if (!pageId) {
      continue
    }

    const userId = await findUserIdByPageId(pageId)
    if (!userId) {
      continue
    }

    for (const event of entry.messaging ?? []) {
      const text = event.message?.text
      const messageId = event.message?.mid
      const senderId = event.sender?.id

      if (!text || !messageId || !senderId) {
        continue
      }

      await upsertInboundMessage({
        userId,
        channel: 'instagram',
        externalThreadId: senderId,
        externalContactId: senderId,
        contactName: event.sender?.name ?? `Instagram ${senderId.slice(-4)}`,
        messageText: text,
        externalMessageId: messageId,
      })
    }

    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') {
        continue
      }

      const text = change.value?.message?.text
      const messageId = change.value?.message?.mid
      const senderId = change.value?.sender?.id

      if (!text || !messageId || !senderId) {
        continue
      }

      await upsertInboundMessage({
        userId,
        channel: 'instagram',
        externalThreadId: senderId,
        externalContactId: senderId,
        contactName: `Instagram ${senderId.slice(-4)}`,
        messageText: text,
        externalMessageId: messageId,
      })
    }
  }
}
