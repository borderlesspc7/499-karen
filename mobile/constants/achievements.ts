import type { LucideIcon } from 'lucide-react-native'
import { Bot, Globe, Target, Trophy, Users, Zap } from 'lucide-react-native'
import type { TranslationKey } from '@shared/i18n'
import type { UserGamificationState } from '@shared/types/gamification'

export type AchievementDefinition = {
  id: string
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  icon: LucideIcon
  isUnlocked: (state: UserGamificationState) => boolean
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-site',
    titleKey: 'achievements.firstSiteTitle',
    descriptionKey: 'achievements.firstSiteDesc',
    icon: Globe,
    isUnlocked: (state) => state.businessHealth.posicionamento >= 50,
  },
  {
    id: 'hundred-leads',
    titleKey: 'achievements.hundredLeadsTitle',
    descriptionKey: 'achievements.hundredLeadsDesc',
    icon: Users,
    isUnlocked: (state) => state.businessHealth.vendas >= 80,
  },
  {
    id: 'first-automation',
    titleKey: 'achievements.firstAutomationTitle',
    descriptionKey: 'achievements.firstAutomationDesc',
    icon: Zap,
    isUnlocked: (state) =>
      state.businessHealth.automacao >= 45 ||
      state.recentActivity.some((item) => item.type === 'automacao'),
  },
  {
    id: 'first-campaign',
    titleKey: 'achievements.firstCampaignTitle',
    descriptionKey: 'achievements.firstCampaignDesc',
    icon: Target,
    isUnlocked: (state) =>
      state.recentActivity.some((item) => item.type === 'marketing'),
  },
  {
    id: 'crm-master',
    titleKey: 'achievements.crmMasterTitle',
    descriptionKey: 'achievements.crmMasterDesc',
    icon: Bot,
    isUnlocked: (state) => state.businessHealth.vendas >= 55,
  },
  {
    id: 'growth-builder',
    titleKey: 'achievements.growthBuilderTitle',
    descriptionKey: 'achievements.growthBuilderDesc',
    icon: Trophy,
    isUnlocked: (state) => state.level >= 10,
  },
]
