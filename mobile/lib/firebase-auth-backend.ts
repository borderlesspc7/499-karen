import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type AuthProvider,
  type User,
} from 'firebase/auth'
import type { AuthBackend, SocialAuthCredential } from '@shared/services/auth-backend'
import { AuthError, mapFirebaseAuthError } from '@shared/services/auth-error'
import type { AuthUser, SocialAuthProvider } from '@shared/types/auth'
import { assertPasswordStrongEnough } from '@shared/utils/password-strength'
import { getFirebaseAuth } from './firebase'

function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email ?? '',
    emailVerified: user.emailVerified,
    providerIds: user.providerData.map((provider) => provider.providerId),
  }
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new AuthError('auth/invalid-email', 'Informe um e-mail válido.')
  }
}

function validatePasswordForSignIn(password: string) {
  if (!password) {
    throw new AuthError('auth/missing-password', 'Informe uma senha.')
  }
}

function validatePasswordForSignUp(password: string) {
  validatePasswordForSignIn(password)

  try {
    assertPasswordStrongEnough(password)
  } catch (error) {
    throw new AuthError(
      'auth/weak-password',
      error instanceof Error
        ? error.message
        : 'A senha deve ser forte: mínimo 8 caracteres, maiúscula, minúscula, número e especial.',
    )
  }
}

function createFirebaseProvider(provider: SocialAuthProvider): AuthProvider {
  switch (provider) {
    case 'google':
      return new GoogleAuthProvider()
    case 'facebook':
      return new FacebookAuthProvider()
    case 'apple': {
      const apple = new OAuthProvider('apple.com')
      apple.addScope('email')
      apple.addScope('name')
      return apple
    }
    case 'microsoft': {
      const microsoft = new OAuthProvider('microsoft.com')
      microsoft.setCustomParameters({ prompt: 'select_account' })
      microsoft.addScope('email')
      microsoft.addScope('openid')
      microsoft.addScope('profile')
      return microsoft
    }
    default:
      throw new AuthError('auth/operation-not-allowed', 'Provedor social não suportado.')
  }
}

function createSocialCredential(input: SocialAuthCredential) {
  switch (input.provider) {
    case 'google':
      return GoogleAuthProvider.credential(input.idToken, input.accessToken)
    case 'facebook':
      return FacebookAuthProvider.credential(input.accessToken ?? input.idToken)
    case 'apple': {
      const apple = new OAuthProvider('apple.com')
      return apple.credential({
        idToken: input.idToken,
        rawNonce: input.nonce,
      })
    }
    case 'microsoft': {
      const microsoft = new OAuthProvider('microsoft.com')
      return microsoft.credential({
        idToken: input.idToken,
        accessToken: input.accessToken,
      })
    }
    default:
      throw new AuthError('auth/operation-not-allowed', 'Provedor social não suportado.')
  }
}

export function createFirebaseAuthBackend(): AuthBackend {
  return {
    onAuthStateChanged(callback) {
      return onAuthStateChanged(getFirebaseAuth(), (user) => {
        callback(user ? toAuthUser(user) : null)
      })
    },

    async signIn(email, password) {
      validateEmail(email)
      validatePasswordForSignIn(password)

      try {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        )
        return toAuthUser(credential.user)
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async signUp(email, password) {
      validateEmail(email)
      validatePasswordForSignUp(password)

      try {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        )
        try {
          await sendEmailVerification(credential.user)
        } catch (verificationError) {
          if (__DEV__) {
            console.warn('[Firebase Auth] sendEmailVerification failed', verificationError)
          }
        }
        return toAuthUser(credential.user)
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async resetPassword(email) {
      validateEmail(email)

      try {
        await sendPasswordResetEmail(getFirebaseAuth(), email.trim())
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async sendEmailVerification() {
      const user = getFirebaseAuth().currentUser
      if (!user) {
        throw new AuthError('auth/user-not-found', 'Nenhuma sessão ativa para verificar o e-mail.')
      }

      try {
        await sendEmailVerification(user)
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async reloadCurrentUser() {
      const user = getFirebaseAuth().currentUser
      if (!user) {
        return null
      }

      try {
        await user.reload()
        const refreshed = getFirebaseAuth().currentUser
        return refreshed ? toAuthUser(refreshed) : null
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async signInWithSocial(input) {
      try {
        const credential = createSocialCredential(input)
        const result = await signInWithCredential(getFirebaseAuth(), credential)
        return toAuthUser(result.user)
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async signInWithSocialPopup(provider) {
      try {
        const result = await signInWithPopup(getFirebaseAuth(), createFirebaseProvider(provider))
        return toAuthUser(result.user)
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },

    async signOut() {
      try {
        await signOut(getFirebaseAuth())
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },
  }
}
