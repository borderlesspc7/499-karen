import { Text, View } from 'react-native'
import { Crown } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey, TranslationParams } from '@shared/i18n'
import type { CompanyTier } from '@shared/types/gamification'

type HomePremiumHeaderProps = {
  userName: string
  companyTier: CompanyTier
}

function resolveGreeting(t: (key: TranslationKey) => string): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return t('home.goodMorning')
  }

  if (hour < 18) {
    return t('home.goodAfternoon')
  }

  return t('home.goodEvening')
}

function formatCompanyTierBadge(
  t: (key: TranslationKey, params?: TranslationParams) => string,
  tier: CompanyTier,
): string {
  if (tier === 'Em Crescimento') {
    return t('home.companyGrowing')
  }

  return t('home.companyTier', { tier })
}

export function HomePremiumHeader({ userName, companyTier }: HomePremiumHeaderProps) {
  const { t } = useTranslation()
  const greeting = resolveGreeting(t)

  return (
    <View className="gap-4">
      <View className="self-start flex-row items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-2">
        <Crown size={16} color="#F59E0B" fill="#F59E0B" />
        <Text className="text-xs font-bold uppercase tracking-wider text-gold">
          {formatCompanyTierBadge(t, companyTier)}
        </Text>
      </View>

      <Text className="text-3xl font-bold text-white">
        {t('home.greetingName', { greeting, name: userName })}
      </Text>
      <Text className="text-sm text-white/60">{t('home.coachMissionReady')}</Text>
    </View>
  )
}
