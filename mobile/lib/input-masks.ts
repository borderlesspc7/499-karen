/** Máscaras e parsers para formulários CRM (pt-BR). */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Máscara de telefone BR: (11) 99999-9999 ou (11) 9999-9999 */
export function maskPhoneBr(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length === 0) {
    return ''
  }

  if (digits.length <= 2) {
    return `(${digits}`
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function unmaskPhoneBr(value: string): string {
  return onlyDigits(value)
}

/** Formata centavos/inteiros em R$ 1.234,56 */
export function maskCurrencyBrl(value: string): string {
  const digits = onlyDigits(value)

  if (!digits) {
    return ''
  }

  const amount = Number(digits) / 100
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Converte máscara R$ para número (ex.: "R$ 1.234,56" → 1234.56) */
export function parseCurrencyBrl(value: string): number {
  const digits = onlyDigits(value)
  if (!digits) {
    return 0
  }

  return Number(digits) / 100
}

export function formatCurrencyInputFromNumber(value: number): string {
  if (!value || value <= 0) {
    return ''
  }

  return maskCurrencyBrl(String(Math.round(value * 100)))
}

export function formatDatePtBr(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function parseDatePtBr(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const date = new Date(year, month, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function toIsoDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function fromIsoDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}
