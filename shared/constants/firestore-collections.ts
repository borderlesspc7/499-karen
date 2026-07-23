export const firestoreCollections = {
  clients: 'clients',
  opportunities: 'opportunities',
  kanbanColumns: 'kanban_columns',
  automations: 'automations',
  users: 'users',
  campaigns: 'campaigns',
  conversations: 'conversations',
  channelConnections: 'channel_connections',
  /** Idempotência de webhooks Stripe (somente Admin SDK) */
  stripeWebhookEvents: 'stripe_webhook_events',
  /** Sessões Checkout mock/em andamento (somente Admin SDK em produção) */
  stripeCheckoutSessions: 'stripe_checkout_sessions',
} as const

export type FirestoreCollection = (typeof firestoreCollections)[keyof typeof firestoreCollections]
