export const firestoreCollections = {
  clients: 'clients',
  opportunities: 'opportunities',
  kanbanColumns: 'kanban_columns',
  automations: 'automations',
  users: 'users',
  campaigns: 'campaigns',
  conversations: 'conversations',
  channelConnections: 'channel_connections',
} as const

export type FirestoreCollection = (typeof firestoreCollections)[keyof typeof firestoreCollections]
