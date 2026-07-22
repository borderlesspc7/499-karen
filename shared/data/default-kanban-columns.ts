import type { KanbanColumn } from '../types/crm'

/** Estrutura padrão do funil (vazia) — não é dado demo. */
export const DEFAULT_KANBAN_COLUMN_DEFS: Array<Omit<KanbanColumn, 'userId'>> = [
  { id: 'col-leads', title: 'Leads', order: 0 },
  { id: 'col-contato', title: 'Contato', order: 1 },
  { id: 'col-proposta', title: 'Proposta', order: 2 },
  { id: 'col-negociacao', title: 'Negociação', order: 3 },
  { id: 'col-fechado', title: 'Fechado', order: 4 },
]

export function buildDefaultKanbanColumns(userId: string): KanbanColumn[] {
  return DEFAULT_KANBAN_COLUMN_DEFS.map((column) => ({
    ...column,
    userId,
  }))
}
