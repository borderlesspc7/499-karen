import type { ConfigContext, ExpoConfig } from 'expo/config'

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAViJL-AqGqr2tfjCQRqkeATE_dPYbjTTI',
  authDomain: 'karen-eaaf4.firebaseapp.com',
  projectId: 'karen-eaaf4',
  storageBucket: 'karen-eaaf4.firebasestorage.app',
  messagingSenderId: '934369528971',
  appId: '1:934369528971:web:3bb1467494455a0865d88e',
} as const

type FirebaseExtraConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function readFirebaseEnv(): FirebaseExtraConfig {
  const read = (envValue: string | undefined, fallback: string) =>
    envValue?.trim() || fallback

  return {
    apiKey: read(process.env.EXPO_PUBLIC_FIREBASE_API_KEY, DEFAULT_FIREBASE_CONFIG.apiKey),
    authDomain: read(
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      DEFAULT_FIREBASE_CONFIG.authDomain,
    ),
    projectId: read(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, DEFAULT_FIREBASE_CONFIG.projectId),
    storageBucket: read(
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      DEFAULT_FIREBASE_CONFIG.storageBucket,
    ),
    messagingSenderId: read(
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    ),
    appId: read(process.env.EXPO_PUBLIC_FIREBASE_APP_ID, DEFAULT_FIREBASE_CONFIG.appId),
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const firebase = readFirebaseEnv()

  return {
    ...config,
    name: 'Summus Edge',
    slug: '499-borderless',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'summus-edge',
    userInterfaceStyle: 'dark',
    backgroundColor: '#04122C',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.borderless.app',
    },
    android: {
      package: 'com.borderless.app',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#04122C',
        foregroundImage: './assets/images/android-icon-foreground.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 280,
          resizeMode: 'contain',
          backgroundColor: '#04122C',
        },
      ],
    ],
    experiments: {
      typedRoutes: false,
    },
    extra: {
      ...config?.extra,
      firebase,
      eas: {
        projectId: '64b83486-e3e3-4b1c-9ed4-68c2f5092dc9',
      },
    },
  }
}
