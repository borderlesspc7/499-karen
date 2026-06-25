export type FirebasePublicConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

/** Configuração pública do Firebase (karen-eaaf4). Chaves de cliente são expostas no app por design. */
export const DEFAULT_FIREBASE_CONFIG: FirebasePublicConfig = {
  apiKey: 'AIzaSyAViJL-AqGqr2tfjCQRqkeATE_dPYbjTTI',
  authDomain: 'karen-eaaf4.firebaseapp.com',
  projectId: 'karen-eaaf4',
  storageBucket: 'karen-eaaf4.firebasestorage.app',
  messagingSenderId: '934369528971',
  appId: '1:934369528971:web:3bb1467494455a0865d88e',
}
