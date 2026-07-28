import { useCallback, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { useAuth, useTranslation } from '@shared/contexts'
import { translate } from '@shared/i18n'
import { AuthError, getAuthErrorMessage } from '@shared/services'
import type { SocialAuthProvider } from '@shared/types/auth'
import {
  buildAppleCredential,
  buildFacebookCredential,
  buildGoogleCredentialFromIdToken,
  buildMicrosoftCredential,
  getProviderNotReadyMessage,
  isSocialProviderReady,
  readOAuthConfig,
  useGoogleAuthRequest,
} from '@/lib/social-auth'

WebBrowser.maybeCompleteAuthSession()

type SocialAuthButtonsProps = {
  onError: (message: string) => void
  disabled?: boolean
}

type ProviderButton = {
  id: SocialAuthProvider
  label: string
  hidden?: boolean
}

const PROVIDERS: ProviderButton[] = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple', hidden: Platform.OS === 'android' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'microsoft', label: 'Microsoft' },
]

function canUseGoogleNativeHook() {
  if (Platform.OS === 'web') {
    return false
  }

  const oauth = readOAuthConfig()

  if (Platform.OS === 'ios') {
    return Boolean(oauth.googleIosClientId || oauth.googleWebClientId)
  }

  if (Platform.OS === 'android') {
    return Boolean(oauth.googleAndroidClientId || oauth.googleWebClientId)
  }

  return false
}

type GoogleNativeLoginProps = {
  onError: (message: string) => void
  disabled?: boolean
  activeProvider: SocialAuthProvider | null
  setActiveProvider: (provider: SocialAuthProvider | null) => void
}

function GoogleNativeLoginButton({
  onError,
  disabled = false,
  activeProvider,
  setActiveProvider,
}: GoogleNativeLoginProps) {
  const { signInWithSocial } = useAuth()
  const { locale } = useTranslation()
  const [, , googlePromptAsync] = useGoogleAuthRequest()
  const isLoading = activeProvider === 'google'

  const handlePress = useCallback(async () => {
    onError('')
    setActiveProvider('google')

    try {
      const result = await googlePromptAsync()
      if (result.type !== 'success') {
        if (result.type === 'dismiss' || result.type === 'cancel') {
          return
        }
        throw new AuthError('auth/invalid-credential', translate(locale, 'system.googleSignInFailed'))
      }

      const idToken =
        result.authentication?.idToken ??
        (typeof result.params?.id_token === 'string' ? result.params.id_token : null)

      if (!idToken) {
        throw new AuthError(
          'auth/invalid-credential',
          translate(locale, 'system.googleTokenMissing'),
        )
      }

      await signInWithSocial(
        await buildGoogleCredentialFromIdToken(idToken, result.authentication?.accessToken),
      )
    } catch (error) {
      onError(getAuthErrorMessage(error, locale))
    } finally {
      setActiveProvider(null)
    }
  }, [googlePromptAsync, locale, onError, setActiveProvider, signInWithSocial])

  return (
    <Pressable
      onPress={() => void handlePress()}
      disabled={disabled || Boolean(activeProvider)}
      className="min-w-[46%] flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-3 active:opacity-80 disabled:opacity-60"
    >
      {isLoading ? (
        <ActivityIndicator color="#04122C" />
      ) : (
        <Text className="text-center text-sm font-semibold text-navy">Google</Text>
      )}
    </Pressable>
  )
}

export function SocialAuthButtons({ onError, disabled = false }: SocialAuthButtonsProps) {
  const { signInWithSocial, signInWithSocialPopup } = useAuth()
  const { t, locale } = useTranslation()
  const [activeProvider, setActiveProvider] = useState<SocialAuthProvider | null>(null)
  const googleNativeReady = canUseGoogleNativeHook()

  const runProvider = useCallback(
    async (provider: SocialAuthProvider) => {
      onError('')
      setActiveProvider(provider)

      try {
        if (Platform.OS === 'web') {
          await signInWithSocialPopup(provider)
          return
        }

        if (!isSocialProviderReady(provider)) {
          throw new AuthError('auth/provider-not-configured', getProviderNotReadyMessage(provider))
        }

        if (provider === 'google') {
          // Sem Client ID nativo o botão dedicado não monta; este caminho cobre web/fallback.
          throw new AuthError('auth/provider-not-configured', getProviderNotReadyMessage('google'))
        }

        if (provider === 'apple') {
          await signInWithSocial(await buildAppleCredential())
          return
        }

        if (provider === 'facebook') {
          const appId = Constants.expoConfig?.extra
            ? (Constants.expoConfig.extra as { oauth?: { facebookAppId?: string } }).oauth
                ?.facebookAppId
            : undefined
          if (!appId) {
            throw new AuthError(
              'auth/provider-not-configured',
              getProviderNotReadyMessage('facebook'),
            )
          }

          const redirectUri = AuthSession.makeRedirectUri({ scheme: 'summus-edge' })
          const authUrl =
            `https://www.facebook.com/v19.0/dialog/oauth` +
            `?client_id=${encodeURIComponent(appId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token` +
            `&scope=${encodeURIComponent('email,public_profile')}`

          const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)
          if (result.type !== 'success' || !('url' in result)) {
            return
          }

          const hash = result.url.split('#')[1] ?? ''
          const accessToken = new URLSearchParams(hash).get('access_token')
          if (!accessToken) {
            throw new AuthError(
              'auth/invalid-credential',
              translate(locale, 'system.facebookTokenMissing'),
            )
          }

          await signInWithSocial(await buildFacebookCredential(accessToken))
          return
        }

        if (provider === 'microsoft') {
          const clientId = Constants.expoConfig?.extra
            ? (Constants.expoConfig.extra as { oauth?: { microsoftClientId?: string } }).oauth
                ?.microsoftClientId
            : undefined
          if (!clientId) {
            throw new AuthError(
              'auth/provider-not-configured',
              getProviderNotReadyMessage('microsoft'),
            )
          }

          const redirectUri = AuthSession.makeRedirectUri({ scheme: 'summus-edge' })
          const discovery = {
            authorizationEndpoint:
              'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          }

          const request = new AuthSession.AuthRequest({
            clientId,
            redirectUri,
            scopes: ['openid', 'profile', 'email', 'offline_access'],
            responseType: AuthSession.ResponseType.IdToken,
            usePKCE: false,
            extraParams: { prompt: 'select_account' },
          })

          const result = await request.promptAsync(discovery)
          if (result.type !== 'success') {
            return
          }

          const idToken =
            typeof result.params.id_token === 'string' ? result.params.id_token : null
          if (!idToken) {
            throw new AuthError(
              'auth/invalid-credential',
              translate(locale, 'system.microsoftTokenMissing'),
            )
          }

          await signInWithSocial(await buildMicrosoftCredential(idToken))
        }
      } catch (error) {
        onError(getAuthErrorMessage(error, locale))
      } finally {
        setActiveProvider(null)
      }
    },
    [locale, onError, signInWithSocial, signInWithSocialPopup],
  )

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-slate-200" />
        <Text className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {t('auth.continueWith')}
        </Text>
        <View className="h-px flex-1 bg-slate-200" />
      </View>

      <View className="flex-row flex-wrap gap-2">
        {PROVIDERS.filter((provider) => !provider.hidden).map((provider) => {
          if (provider.id === 'google' && googleNativeReady) {
            return (
              <GoogleNativeLoginButton
                key={provider.id}
                onError={onError}
                disabled={disabled}
                activeProvider={activeProvider}
                setActiveProvider={setActiveProvider}
              />
            )
          }

          const isLoading = activeProvider === provider.id
          const isDisabled = disabled || Boolean(activeProvider)

          return (
            <Pressable
              key={provider.id}
              onPress={() => void runProvider(provider.id)}
              disabled={isDisabled}
              className="min-w-[46%] flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-3 active:opacity-80 disabled:opacity-60"
            >
              {isLoading ? (
                <ActivityIndicator color="#04122C" />
              ) : (
                <Text className="text-center text-sm font-semibold text-navy">
                  {provider.label}
                </Text>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
