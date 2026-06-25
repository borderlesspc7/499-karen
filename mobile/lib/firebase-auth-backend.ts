import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import type { AuthBackend } from '@shared/services/auth-backend'
import { AuthError, mapFirebaseAuthError } from '@shared/services/auth-error'
import type { AuthUser } from '@shared/types/auth'
import { getFirebaseAuth } from './firebase'

function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email ?? '',
  }
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new AuthError('auth/invalid-email', 'Informe um e-mail válido.')
  }
}

function validatePassword(password: string) {
  if (!password) {
    throw new AuthError('auth/missing-password', 'Informe uma senha.')
  }

  if (password.length < 6) {
    throw new AuthError(
      'auth/weak-password',
      'A senha deve conter pelo menos 6 caracteres.',
    )
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
      validatePassword(password)

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
      validatePassword(password)

      try {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        )
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

    async signOut() {
      try {
        await signOut(getFirebaseAuth())
      } catch (error) {
        throw mapFirebaseAuthError(error)
      }
    },
  }
}
