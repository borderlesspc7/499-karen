import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions'
import { getFirebaseApp } from './firebase'

let functionsInstance: Functions | null = null

export function getFirebaseFunctions(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(getFirebaseApp(), 'us-central1')

    if (__DEV__ && process.env.EXPO_PUBLIC_FUNCTIONS_EMULATOR === '1') {
      connectFunctionsEmulator(functionsInstance, '127.0.0.1', 5001)
    }
  }

  return functionsInstance
}
