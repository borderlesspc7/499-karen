import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { AuthError } from '@shared/services/auth-error'
import type { SocialAuthCredential } from '@shared/services/auth-backend'
import type { SocialAuthProvider } from '@shared/types/auth'

WebBrowser.maybeCompleteAuthSession()

type OAuthExtraConfig = {
  googleWebClientId?: string
  googleIosClientId?: string
  googleAndroidClientId?: string
  facebookAppId?: string
  microsoftClientId?: string
}

function readOAuthConfig(): OAuthExtraConfig {
  const extra = Constants.expoConfig?.extra as { oauth?: OAuthExtraConfig } | undefined
  return extra?.oauth ?? {}
}

export { readOAuthConfig }

function requireConfigured(condition: boolean, providerLabel: string) {
  if (!condition) {
    throw new AuthError(
      'auth/provider-not-configured',
      `${providerLabel} ainda não está configurado. Ative o provedor no Firebase Console e adicione as chaves no app.`,
    )
  }
}

function createNonce(length = 32) {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._'
  let result = ''
  for (let index = 0; index < length; index += 1) {
    result += charset[Math.floor(Math.random() * charset.length)]
  }
  return result
}

export function useGoogleAuthRequest() {
  const oauth = readOAuthConfig()

  return Google.useAuthRequest({
    webClientId: oauth.googleWebClientId || undefined,
    iosClientId: oauth.googleIosClientId || undefined,
    androidClientId: oauth.googleAndroidClientId || undefined,
  })
}

export async function buildAppleCredential(): Promise<SocialAuthCredential> {
  requireConfigured(Platform.OS === 'ios', 'Apple ID')

  const rawNonce = createNonce()
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  )

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  })

  if (!appleCredential.identityToken) {
    throw new AuthError('auth/invalid-credential', 'Não foi possível obter o token da Apple.')
  }

  return {
    provider: 'apple',
    idToken: appleCredential.identityToken,
    nonce: rawNonce,
  }
}

export async function buildGoogleCredentialFromIdToken(
  idToken: string,
  accessToken?: string,
): Promise<SocialAuthCredential> {
  requireConfigured(Boolean(idToken), 'Google')
  return {
    provider: 'google',
    idToken,
    accessToken,
  }
}

export async function buildFacebookCredential(
  accessToken: string,
): Promise<SocialAuthCredential> {
  requireConfigured(Boolean(accessToken), 'Facebook')
  return {
    provider: 'facebook',
    idToken: accessToken,
    accessToken,
  }
}

export async function buildMicrosoftCredential(
  idToken: string,
  accessToken?: string,
): Promise<SocialAuthCredential> {
  requireConfigured(Boolean(idToken), 'Microsoft')
  return {
    provider: 'microsoft',
    idToken,
    accessToken,
  }
}

export function isSocialProviderReady(provider: SocialAuthProvider): boolean {
  if (Platform.OS === 'web') {
    return true
  }

  const oauth = readOAuthConfig()

  switch (provider) {
    case 'google':
      return Boolean(
        oauth.googleWebClientId || oauth.googleIosClientId || oauth.googleAndroidClientId,
      )
    case 'apple':
      return Platform.OS === 'ios'
    case 'facebook':
      return Boolean(oauth.facebookAppId)
    case 'microsoft':
      return Boolean(oauth.microsoftClientId)
    default:
      return false
  }
}

export function getProviderNotReadyMessage(provider: SocialAuthProvider): string {
  const labels: Record<SocialAuthProvider, string> = {
    google: 'Google',
    apple: 'Apple ID',
    facebook: 'Facebook',
    microsoft: 'Microsoft',
  }

  if (provider === 'apple' && Platform.OS !== 'ios') {
    return 'Apple ID está disponível apenas em dispositivos iOS.'
  }

  return `${labels[provider]} ainda não está configurado. Ative no Firebase Console e adicione as chaves no app.`
}
