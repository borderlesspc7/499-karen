import { onRequest } from 'firebase-functions/v2/https'
import {
  appDeepLinkScheme,
  getFunctionsBaseUrl,
  linkedinClientSecret,
  metaAppSecret,
} from './config'
import {
  connectLinkedInChannel,
  connectMetaChannel,
  exchangeLinkedInCode,
  exchangeMetaCode,
} from './oauth-connect'
import { parseOAuthState, saveChannelConnection } from './utils'

export const oauthCallback = onRequest(
  {
    secrets: [metaAppSecret, linkedinClientSecret],
    cors: true,
  },
  async (request, response) => {
    const code = request.query.code as string | undefined
    const state = request.query.state as string | undefined
    const error = request.query.error as string | undefined
    const deepLinkScheme = appDeepLinkScheme.value()
    const redirectUri = `${getFunctionsBaseUrl()}/oauthCallback`

    if (error || !code || !state) {
      response.redirect(`${deepLinkScheme}://integrations?status=error&message=${error ?? 'oauth_failed'}`)
      return
    }

    const parsed = parseOAuthState(state, metaAppSecret.value())
    if (!parsed) {
      response.redirect(`${deepLinkScheme}://integrations?status=error&message=invalid_state`)
      return
    }

    try {
      if (parsed.channel === 'linkedin') {
        const accessToken = await exchangeLinkedInCode(code, redirectUri, linkedinClientSecret.value())
        await connectLinkedInChannel(parsed.userId, accessToken)
      } else {
        const accessToken = await exchangeMetaCode(code, redirectUri, metaAppSecret.value())
        await connectMetaChannel(parsed.userId, parsed.channel, accessToken)
      }

      response.redirect(`${deepLinkScheme}://integrations?status=connected&channel=${parsed.channel}`)
    } catch (connectError) {
      const message =
        connectError instanceof Error ? connectError.message : 'connection_failed'

      await saveChannelConnection(parsed.userId, parsed.channel, {
        status: 'error',
        errorMessage: message,
      })

      response.redirect(
        `${deepLinkScheme}://integrations?status=error&channel=${parsed.channel}&message=${encodeURIComponent(message)}`,
      )
    }
  },
)
