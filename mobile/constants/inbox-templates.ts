import type { TranslationKey } from '@shared/i18n'

export const INBOX_QUICK_TEMPLATE_KEYS = [
  'inbox.tplGreeting',
  'inbox.tplChecking',
  'inbox.tplSchedule',
  'inbox.tplProposal',
] as const satisfies readonly TranslationKey[]
