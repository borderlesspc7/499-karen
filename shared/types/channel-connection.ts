export type MessagingChannel = 'whatsapp' | 'instagram' | 'facebook' | 'linkedin'

export type ChannelConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error'

export type ChannelConnection = {
  channel: MessagingChannel
  status: ChannelConnectionStatus
  externalAccountId?: string
  externalAccountName?: string
  pageId?: string
  phoneNumberId?: string
  instagramAccountId?: string
  wabaId?: string
  connectedAt?: string
  updatedAt?: string
  errorMessage?: string
}

export type ChannelConnectionsSnapshot = Record<MessagingChannel, ChannelConnection>

export const DEFAULT_CHANNEL_CONNECTIONS: ChannelConnectionsSnapshot = {
  whatsapp: { channel: 'whatsapp', status: 'disconnected' },
  instagram: { channel: 'instagram', status: 'disconnected' },
  facebook: { channel: 'facebook', status: 'disconnected' },
  linkedin: { channel: 'linkedin', status: 'disconnected' },
}
