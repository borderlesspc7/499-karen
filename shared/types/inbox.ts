export type InboxChannel = 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'email' | 'sms'

export type InboxPriority = 'hot' | 'warm' | 'cold'

export type InboxContactStatus = 'online' | 'away' | 'offline'

export type InboxMessageRole = 'contact' | 'agent' | 'ai'

export type InboxMessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type InboxMessage = {
  id: string
  role: InboxMessageRole
  text: string
  timestamp: string
  externalMessageId?: string
  deliveryStatus?: InboxMessageDeliveryStatus
  createdAt?: string
}

export type InboxConversation = {
  id: string
  userId: string
  contactName: string
  company: string
  preview: string
  channel: InboxChannel
  status: InboxContactStatus
  unreadCount: number
  updatedAt: string
  messages: InboxMessage[]
  priority: InboxPriority
  aiSummary: string
  estimatedValue: number
  clientId?: string
  externalThreadId?: string
  externalContactId?: string
}
