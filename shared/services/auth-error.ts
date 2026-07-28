import type { AppLocale } from '../types/locale'
import { DEFAULT_LOCALE } from '../types/locale'
import { translate, type TranslationKey } from '../i18n'

export class AuthError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

/** @deprecated Use AuthError */
export const MockAuthError = AuthError

export function isAuthError(error: unknown): error is AuthError {
  if (error instanceof AuthError) {
    return true
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    (error as AuthError).name === 'AuthError' &&
    typeof (error as AuthError).code === 'string' &&
    typeof (error as AuthError).message === 'string'
  )
}

function readErrorMessage(error: object): string {
  if ('message' in error && typeof error.message === 'string') {
    return error.message
  }

  return ''
}

const FIREBASE_AUTH_KEYS: Record<string, TranslationKey> = {
  'auth/invalid-email': 'authErrors.invalidEmail',
  'auth/missing-password': 'authErrors.missingPassword',
  'auth/user-disabled': 'authErrors.userDisabled',
  'auth/user-not-found': 'authErrors.userNotFound',
  'auth/wrong-password': 'authErrors.wrongPassword',
  'auth/invalid-credential': 'authErrors.invalidCredential',
  'auth/email-already-in-use': 'authErrors.emailInUse',
  'auth/weak-password': 'authErrors.weakPassword',
  'auth/too-many-requests': 'authErrors.tooManyRequests',
  'auth/network-request-failed': 'authErrors.networkFailed',
  'auth/operation-not-allowed': 'authErrors.operationNotAllowed',
  'auth/admin-restricted-operation': 'authErrors.adminRestricted',
  'auth/configuration-not-found': 'authErrors.configurationNotFound',
  'auth/invalid-api-key': 'authErrors.invalidApiKey',
  'auth/app-not-authorized': 'authErrors.appNotAuthorized',
  'auth/popup-closed-by-user': 'authErrors.popupClosed',
  'auth/cancelled-popup-request': 'authErrors.popupClosed',
  'auth/account-exists-with-different-credential': 'authErrors.accountExistsDifferent',
  'auth/provider-not-configured': 'authErrors.providerNotConfigured',
}

function mapFirebaseAuthCode(
  code: string,
  fallbackMessage: string,
  locale: AppLocale,
): string {
  const key = FIREBASE_AUTH_KEYS[code]
  if (key) {
    return translate(locale, key)
  }

  if (fallbackMessage && !fallbackMessage.startsWith('Firebase:')) {
    return fallbackMessage
  }

  return translate(locale, 'authErrors.unknownCode', { code })
}

export function getAuthErrorMessage(
  error: unknown,
  locale: AppLocale = DEFAULT_LOCALE,
): string {
  if (isAuthError(error)) {
    return error.message
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    return mapFirebaseAuthCode(code, readErrorMessage(error), locale)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return translate(locale, 'authErrors.fallback')
}

export function mapFirebaseAuthError(
  error: unknown,
  locale: AppLocale = DEFAULT_LOCALE,
): AuthError {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    const fallbackMessage = readErrorMessage(error)

    if (__DEV__) {
      console.warn('[Firebase Auth]', code, fallbackMessage)
    }

    return new AuthError(code, mapFirebaseAuthCode(code, fallbackMessage, locale))
  }

  if (__DEV__ && error) {
    console.warn('[Firebase Auth] unknown error', error)
  }

  return new AuthError('auth/unknown', translate(locale, 'authErrors.fallback'))
}
