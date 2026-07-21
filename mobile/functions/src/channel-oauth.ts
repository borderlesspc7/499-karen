import { onCall, HttpsError } from 'firebase-functions/v2/https'
import {
  appDeepLinkScheme,
  getFunctionsBaseUrl,
  linkedinClientId,
  metaAppId,
  metaAppSecret,
  META_SCOPES,
  LINKEDIN_SCOPES,
} from './config'
import { buildOAuthState, db, saveChannelConnection, type MessagingChannel } from './utils'

const META_CHANNELS = new Set<MessagingChannel>(['whatsapp', 'instagram', 'facebook'])

export const startChannelOAuth = onCall(
  {
    secrets: [metaAppSecret],
    cors: true,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado.')
    }

    const channel = request.data?.channel as MessagingChannel
    if (!channel || !['whatsapp', 'instagram', 'facebook', 'linkedin'].includes(channel)) {
      throw new HttpsError('invalid-argument', 'Canal inválido.')
    }

    const userId = request.auth.uid
    const state = buildOAuthState(userId, channel, metaAppSecret.value())
    const redirectUri = `${getFunctionsBaseUrl()}/oauthCallback`
    const deepLinkScheme = appDeepLinkScheme.value()

    await saveChannelConnection(userId, channel, { status: 'pending' })

    if (META_CHANNELS.has(channel)) {
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
    }

    const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    linkedinAuthUrl.searchParams.set('response_type', 'code')
    linkedinAuthUrl.searchParams.set('client_id', linkedinClientId.value())
    linkedinAuthUrl.searchParams.set('redirect_uri', redirectUri)
    linkedinAuthUrl.searchParams.set('state', state)
    linkedinAuthUrl.searchParams.set('scope', LINKEDIN_SCOPES.join(' '))

    return {
      authUrl: linkedinAuthUrl.toString(),
      redirectUri: `${deepLinkScheme}://integrations`,
    }
  },
)

export const getChannelConnections = onCall({ cors: true }, async (request) => {
  if (!request.auth?.uid) {
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
    linkedin: { channel: 'linkedin', status: 'disconnected' },
  }

  for (const document of snapshot.docs) {
    connections[document.id] = document.data()
  }

  return { connections }
})

export const disconnectChannel = onCall({ cors: true }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Usuário não autenticado.')
  }

  const channel = request.data?.channel as MessagingChannel
  if (!channel) {
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
