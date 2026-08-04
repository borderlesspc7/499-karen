import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { ENFORCE_APP_CHECK } from './app-check'
import {
  appDeepLinkScheme,
  getFunctionsBaseUrl,
  metaAppId,
  metaAppSecret,
  META_SCOPES,
} from './config'
import { buildOAuthState, db, saveChannelConnection, type MessagingChannel } from './utils'
import { audit, warn } from './logger'
import { assertRateLimit, RATE_LIMIT_PRESETS } from './rate-limit'

const META_CHANNELS = new Set<MessagingChannel>(['whatsapp', 'instagram', 'facebook'])

export const startChannelOAuth = onCall(
  {
    secrets: [metaAppSecret],
    cors: true,
    enforceAppCheck: ENFORCE_APP_CHECK,
  },
  async (request) => {
    if (!request.auth?.uid) {
      warn('Unauthenticated channel OAuth attempt')
      throw new HttpsError('unauthenticated', 'Usuário não autenticado.')
    }

    const userId = request.auth.uid
    assertRateLimit({
      key: `oauth:${userId}`,
      ...RATE_LIMIT_PRESETS.oauth,
    })

    const channel = request.data?.channel as MessagingChannel
    if (!channel || !META_CHANNELS.has(channel)) {
      throw new HttpsError('invalid-argument', 'Canal inválido.')
    }

    const state = buildOAuthState(userId, channel, metaAppSecret.value())
    const redirectUri = `${getFunctionsBaseUrl()}/oauthCallback`
    const deepLinkScheme = appDeepLinkScheme.value()

    await saveChannelConnection(userId, channel, { status: 'pending' })
    audit({ action: 'channel_oauth_started', userId, meta: { channel } })

    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
    authUrl.searchParams.set('client_id', metaAppId.value())
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', META_SCOPES[channel].join(','))
    authUrl.searchParams.set('response_type', 'code')

    return {
      authUrl: authUrl.toString(),
      redirectUri: `${deepLinkScheme}://integrations`,
    }
  },
)

export const getChannelConnections = onCall({ cors: true }, async (request) => {
  if (!request.auth?.uid) {
    warn('Unauthenticated channel connections read attempt')
    throw new HttpsError('unauthenticated', 'Usuário não autenticado.')
  }

  const snapshot = await db
    .collection('channel_connections')
    .doc(request.auth.uid)
    .collection('channels')
    .get()

  const connections: Record<string, unknown> = {
    whatsapp: { channel: 'whatsapp', status: 'disconnected' },
    instagram: { channel: 'instagram', status: 'disconnected' },
    facebook: { channel: 'facebook', status: 'disconnected' },
  }

  for (const document of snapshot.docs) {
    if (META_CHANNELS.has(document.id as MessagingChannel)) {
      connections[document.id] = document.data()
    }
  }

  return { connections }
})

export const disconnectChannel = onCall({ cors: true }, async (request) => {
  if (!request.auth?.uid) {
    warn('Unauthenticated channel disconnect attempt')
    throw new HttpsError('unauthenticated', 'Usuário não autenticado.')
  }

  const channel = request.data?.channel as MessagingChannel
  if (!channel || !META_CHANNELS.has(channel)) {
    throw new HttpsError('invalid-argument', 'Canal inválido.')
  }

  const userId = request.auth.uid

  await saveChannelConnection(userId, channel, {
    status: 'disconnected',
    externalAccountId: null,
    externalAccountName: null,
    pageId: null,
    phoneNumberId: null,
    instagramAccountId: null,
    wabaId: null,
    errorMessage: null,
  })

  await db
    .collection('integration_secrets')
    .doc(userId)
    .collection('channels')
    .doc(channel)
    .delete()

  return { success: true }
})
