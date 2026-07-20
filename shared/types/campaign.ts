export type SavedCampaignObjective =
  | 'sell'
  | 'schedule'
  | 'authority'
  | 'reactivate'
  | 'promote'

export type SavedCampaignStatus = 'active' | 'paused' | 'draft'

export type SavedCampaignMetrics = {
  views: number
  leads: number
  costPerLead: number
}

export type SavedCampaign = {
  id: string
  userId: string
  title: string
  objective: SavedCampaignObjective
  audience: string
  offer: string
  status: SavedCampaignStatus
  channels: string[]
  pieceCount: number
  estimatedLeads: number
  metrics: SavedCampaignMetrics
  prompt: string
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export type CreateSavedCampaignInput = {
  userId: string
  title: string
  objective: SavedCampaignObjective
  audience: string
  offer: string
  channels: string[]
  pieceCount: number
  estimatedLeads: number
  prompt: string
}
