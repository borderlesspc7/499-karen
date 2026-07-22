import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
// Metro resolve `firebase/auth` para o bundle React Native no iOS/Android.
// @ts-expect-error getReactNativePersistence existe no bundle RN, não nos tipos web.
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getFirebasePublicConfig } from './env'

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let firestoreDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null

function createFirebaseAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app)
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''

    if (message.includes('already been initialized')) {
      return getAuth(app)
    }

    throw error
  }
}

export function initializeFirebase(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp
  }

  const config = getFirebasePublicConfig()

  if (__DEV__) {
    console.info('[Firebase] projectId:', config.projectId, '| authDomain:', config.authDomain)
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config)
  firebaseAuth = createFirebaseAuth(firebaseApp)
  firestoreDb = getFirestore(firebaseApp)
  firebaseStorage = getStorage(firebaseApp)

  return firebaseApp
}

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    return initializeFirebase()
  }

  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  initializeFirebase()

  if (!firebaseAuth) {
    throw new Error('Firebase Auth não foi inicializado.')
  }

  return firebaseAuth
}

export function getFirestoreDb(): Firestore {
  initializeFirebase()

  if (!firestoreDb) {
    throw new Error('Firestore não foi inicializado.')
  }

  return firestoreDb
}

export function getFirebaseStorage(): FirebaseStorage {
  initializeFirebase()

  if (!firebaseStorage) {
    throw new Error('Firebase Storage não foi inicializado.')
  }

  return firebaseStorage
}
