import type { UserProfile } from './gamification'

export type TargetClientType =
  | 'mulheres-estetica'
  | 'executivos'
  | 'noivas-eventos'
  | 'premium-alto-ticket'
  | 'publico-local'
  | 'outro'

export type BrandColors = {
  primary: string
  secondary: string
  accent: string
}

export type BrandIdentity = {
  companyName: string
  servicesDescription: string
  targetClientType: TargetClientType
  targetClientDescription: string
  logoUri: string | null
  colors: BrandColors
  completedAt: string
}

export type BrandIdentityDraft = Omit<BrandIdentity, 'completedAt'> & {
  businessProfile: UserProfile
}
