import type { TranslationKey } from '../i18n'
import type { TaskCategory, TaskPriority } from '../types/crm'

/** Labels PT — fallback histórico / Firestore; UI deve preferir `t()` via keys abaixo. */
export const categoryLabels: Record<TaskCategory, string> = {
  vendas: 'Vendas',
  suporte: 'Suporte',
  marketing: 'Marketing',
  'follow-up': 'Follow-up',
}

export const priorityLabels: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

export const CATEGORY_IDS = Object.keys(categoryLabels) as TaskCategory[]
export const PRIORITY_IDS = Object.keys(priorityLabels) as TaskPriority[]

export const CATEGORY_LABEL_KEYS: Record<TaskCategory, TranslationKey> = {
  vendas: 'crm.catSales',
  suporte: 'crm.catSupport',
  marketing: 'crm.catMarketing',
  'follow-up': 'crm.catFollowUp',
}

export const PRIORITY_LABEL_KEYS: Record<TaskPriority, TranslationKey> = {
  baixa: 'crm.priLow',
  media: 'crm.priMedium',
  alta: 'crm.priHigh',
}

type TranslateFn = (key: TranslationKey) => string

export function getCategoryLabel(t: TranslateFn, id: TaskCategory): string {
  return t(CATEGORY_LABEL_KEYS[id])
}

export function getPriorityLabel(t: TranslateFn, id: TaskPriority): string {
  return t(PRIORITY_LABEL_KEYS[id])
}
