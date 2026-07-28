import type { TranslationKey } from '../i18n'
import type { KanbanColumn } from '../types/crm'

/** Estrutura padrão do funil (vazia) — não é dado demo. Titles PT ficam no Firestore historicamente. */
export const DEFAULT_KANBAN_COLUMN_DEFS: Array<Omit<KanbanColumn, 'userId'>> = [
  { id: 'col-leads', title: 'Leads', order: 0 },
  { id: 'col-contato', title: 'Contato', order: 1 },
  { id: 'col-proposta', title: 'Proposta', order: 2 },
  { id: 'col-negociacao', title: 'Negociação', order: 3 },
  { id: 'col-fechado', title: 'Fechado', order: 4 },
]

/** Map column id → i18n key for display (Firestore titles remain PT). */
export const KANBAN_COLUMN_TITLE_KEYS: Record<string, TranslationKey> = {
  'col-leads': 'crm.colLeads',
  'col-contato': 'crm.colContact',
  'col-proposta': 'crm.colProposal',
  'col-negociacao': 'crm.colNegotiation',
  'col-fechado': 'crm.colClosed',
}

type TranslateFn = (key: TranslationKey) => string

export function getKanbanColumnTitle(
  t: TranslateFn,
  columnId: string,
  fallbackTitle?: string | null,
): string {
  const key = KANBAN_COLUMN_TITLE_KEYS[columnId]
  if (key) {
    return t(key)
  }

  return fallbackTitle ?? columnId
}

export function buildDefaultKanbanColumns(userId: string): KanbanColumn[] {
  return DEFAULT_KANBAN_COLUMN_DEFS.map((column) => ({
    ...column,
    userId,
  }))
}
