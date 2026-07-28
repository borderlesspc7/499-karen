export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export type PasswordFeedbackCode =
  | 'minLength'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'special'

export type PasswordStrengthResult = {
  level: PasswordStrengthLevel
  score: number
  /** Level key for UI (`password.weak` etc.); empty when password is blank. */
  label: PasswordStrengthLevel | ''
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
  isStrongEnough: boolean
  /** Codes mapped to `password.*` dictionary keys in the UI. */
  feedback: PasswordFeedbackCode[]
}

export const PASSWORD_MIN_LENGTH = 8

const FEEDBACK_FALLBACK_PT: Record<PasswordFeedbackCode, string> = {
  minLength: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
  uppercase: 'Uma letra maiúscula',
  lowercase: 'Uma letra minúscula',
  number: 'Um número',
  special: 'Um caractere especial (!@#$…)',
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: /[A-ZÀ-Ý]/.test(password),
    hasLowercase: /[a-zà-ÿ]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-zÀ-ÿ0-9]/.test(password),
  }

  const passedCount = Object.values(checks).filter(Boolean).length
  const feedback: PasswordFeedbackCode[] = []

  if (!checks.minLength) feedback.push('minLength')
  if (!checks.hasUppercase) feedback.push('uppercase')
  if (!checks.hasLowercase) feedback.push('lowercase')
  if (!checks.hasNumber) feedback.push('number')
  if (!checks.hasSpecial) feedback.push('special')

  if (!password) {
    return {
      level: 'empty',
      score: 0,
      label: '',
      checks,
      isStrongEnough: false,
      feedback,
    }
  }

  let level: PasswordStrengthLevel = 'weak'

  if (passedCount >= 5 && password.length >= 12) {
    level = 'strong'
  } else if (passedCount >= 5) {
    level = 'good'
  } else if (passedCount >= 3) {
    level = 'fair'
  }

  return {
    level,
    score: passedCount,
    label: level,
    checks,
    isStrongEnough: passedCount === 5,
    feedback,
  }
}

export function assertPasswordStrongEnough(password: string): void {
  const result = evaluatePasswordStrength(password)
  if (!result.isStrongEnough) {
    const details = result.feedback
      .map((code) => FEEDBACK_FALLBACK_PT[code].toLowerCase())
      .join(', ')
    throw new Error(`Senha fraca. Inclua: ${details}.`)
  }
}
