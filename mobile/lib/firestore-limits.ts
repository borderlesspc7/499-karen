/**
 * Limites padrão de leitura Firestore — evita scans ilimitados por usuário.
 * Ajuste por feature conforme o produto crescer (paginação cursor).
 */
export const FIRESTORE_PAGE_LIMITS = {
  conversations: 100,
  messages: 80,
  clients: 200,
  cards: 300,
  columns: 50,
  campaigns: 100,
  automations: 100,
} as const

export type ListQueryOptions = {
  limit?: number
}
