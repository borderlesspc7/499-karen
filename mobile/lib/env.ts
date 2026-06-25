import Constants from 'expo-constants'
import { DEFAULT_FIREBASE_CONFIG, type FirebasePublicConfig } from '@/constants/firebase-config'

export type { FirebasePublicConfig }

const FIREBASE_ENV_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const

function readEnvValue(key: (typeof FIREBASE_ENV_KEYS)[number]): string {
  const value = process.env[key]
  return value?.trim() ?? ''
}

function mergeFirebaseConfig(
  partial: Partial<FirebasePublicConfig>,
): FirebasePublicConfig {
  return {
    apiKey: partial.apiKey?.trim() || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: partial.authDomain?.trim() || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: partial.projectId?.trim() || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: partial.storageBucket?.trim() || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      partial.messagingSenderId?.trim() || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: partial.appId?.trim() || DEFAULT_FIREBASE_CONFIG.appId,
  }
}

function readFromProcessEnv(): FirebasePublicConfig {
  return mergeFirebaseConfig({
    apiKey: readEnvValue('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: readEnvValue('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnvValue('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: readEnvValue('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnvValue('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnvValue('EXPO_PUBLIC_FIREBASE_APP_ID'),
  })
}

function readFromExpoExtra(): FirebasePublicConfig | null {
  const firebase = Constants.expoConfig?.extra?.firebase as Partial<FirebasePublicConfig> | undefined

  if (!firebase) {
    return null
  }

  return mergeFirebaseConfig(firebase)
}

function getMissingKeys(config: FirebasePublicConfig): string[] {
  const entries: Array<[string, string]> = [
    ['EXPO_PUBLIC_FIREBASE_API_KEY', config.apiKey],
    ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', config.authDomain],
    ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', config.projectId],
    ['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', config.storageBucket],
    ['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', config.messagingSenderId],
    ['EXPO_PUBLIC_FIREBASE_APP_ID', config.appId],
  ]

  return entries.filter(([, value]) => !value.trim()).map(([key]) => key)
}

export function getFirebasePublicConfig(): FirebasePublicConfig {
  const fromExtra = readFromExpoExtra()
  const config = fromExtra ?? readFromProcessEnv()
  const missingKeys = getMissingKeys(config)

  if (missingKeys.length > 0) {
    throw new Error(
      `Configuração Firebase incompleta (${missingKeys.join(', ')}). ` +
        'Para builds EAS, defina as variáveis no painel Expo ou rode: eas env:push --environment preview',
    )
  }

  return config
}

export function getFirebaseConfigError(): string | null {
  try {
    getFirebasePublicConfig()
    return null
  } catch (error) {
    return error instanceof Error ? error.message : 'Configuração Firebase inválida.'
  }
}

export const firebaseEnv = {
  projectId:
    Constants.expoConfig?.extra?.firebase?.projectId?.trim() ||
    readEnvValue('EXPO_PUBLIC_FIREBASE_PROJECT_ID') ||
    DEFAULT_FIREBASE_CONFIG.projectId,
} as const

export const firebaseEnvKeyNames = FIREBASE_ENV_KEYS
