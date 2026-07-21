export type IntegrationId = 'instagram' | 'facebook' | 'linkedin' | 'google' | 'whatsapp' | 'email'

export type UserIntegrations = Record<IntegrationId, boolean>

export type TeamMember = {
  id: string
  name: string
  role: string
  status: 'Ativo' | 'Pendente' | 'Inativo'
  email?: string
}

export type UserSettings = {
  integrations: UserIntegrations
  teamMembers: TeamMember[]
}

export const DEFAULT_INTEGRATIONS: UserIntegrations = {
  instagram: false,
  facebook: false,
  linkedin: false,
  google: false,
  whatsapp: false,
  email: false,
}
