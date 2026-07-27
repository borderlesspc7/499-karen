export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export type PasswordStrengthResult = {
  level: PasswordStrengthLevel
  score: number
  label: string
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
  isStrongEnough: boolean
  feedback: string[]
}

const MIN_LENGTH = 8

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= MIN_LENGTH,
    hasUppercase: /[A-ZÀ-Ý]/.test(password),
    hasLowercase: /[a-zà-ÿ]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-zÀ-ÿ0-9]/.test(password),
  }

  const passedCount = Object.values(checks).filter(Boolean).length
  const feedback: string[] = []

  if (!checks.minLength) feedback.push(`Pelo menos ${MIN_LENGTH} caracteres`)
  if (!checks.hasUppercase) feedback.push('Uma letra maiúscula')
  if (!checks.hasLowercase) feedback.push('Uma letra minúscula')
  if (!checks.hasNumber) feedback.push('Um número')
  if (!checks.hasSpecial) feedback.push('Um caractere especial (!@#$…)')

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
  let label = 'Fraca'

  if (passedCount >= 5 && password.length >= 12) {
    level = 'strong'
    label = 'Forte'
  } else if (passedCount >= 5) {
    level = 'good'
    label = 'Boa'
  } else if (passedCount >= 3) {
    level = 'fair'
    label = 'Razoável'
  }

  return {
    level,
    score: passedCount,
    label,
    checks,
    isStrongEnough: passedCount === 5,
    feedback,
  }
}

export function assertPasswordStrongEnough(password: string): void {
  const result = evaluatePasswordStrength(password)
  if (!result.isStrongEnough) {
    throw new Error(
      `Senha fraca. Inclua: ${result.feedback.join(', ').toLowerCase()}.`,
    )
  }
}
