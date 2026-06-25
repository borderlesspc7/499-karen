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

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    return error.message
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    return mapFirebaseAuthCode(code, readErrorMessage(error))
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Não foi possível concluir a autenticação. Tente novamente.'
}

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/missing-password': 'Informe uma senha.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/user-not-found': 'Não encontramos uma conta com este e-mail.',
  'auth/wrong-password': 'Credenciais inválidas. Revise e-mail e senha.',
  'auth/invalid-credential': 'Credenciais inválidas. Revise e-mail e senha.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha deve conter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet e tente novamente.',
  'auth/operation-not-allowed':
    'Cadastro por e-mail/senha não está ativo no Firebase. Ative em Authentication → Sign-in method → E-mail/senha.',
  'auth/admin-restricted-operation':
    'Cadastro por e-mail/senha não está ativo no Firebase. Ative em Authentication → Sign-in method → E-mail/senha.',
  'auth/configuration-not-found':
    'Authentication não está configurado no projeto Firebase. Abra o console → Authentication → "Começar", ative E-mail/senha e habilite a API Identity Toolkit no Google Cloud.',
  'auth/invalid-api-key': 'Chave da API Firebase inválida. Verifique a configuração do projeto.',
  'auth/app-not-authorized':
    'Este app não está autorizado no Firebase. Adicione o domínio/bundle no console do Firebase.',
}

function mapFirebaseAuthCode(code: string, fallbackMessage: string): string {
  if (FIREBASE_AUTH_MESSAGES[code]) {
    return FIREBASE_AUTH_MESSAGES[code]
  }

  if (fallbackMessage && !fallbackMessage.startsWith('Firebase:')) {
    return fallbackMessage
  }

  return `Erro de autenticação (${code}). Verifique o Firebase Console.`
}

export function mapFirebaseAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    const fallbackMessage = readErrorMessage(error)

    if (__DEV__) {
      console.warn('[Firebase Auth]', code, fallbackMessage)
    }

    return new AuthError(code, mapFirebaseAuthCode(code, fallbackMessage))
  }

  if (__DEV__ && error) {
    console.warn('[Firebase Auth] unknown error', error)
  }

  return new AuthError('auth/unknown', 'Não foi possível concluir a autenticação. Tente novamente.')
}
