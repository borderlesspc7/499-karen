import {
  Building2,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store,
  UserRound,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import type { UserProfile } from '@shared/types/gamification'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusLogo } from '@/components/ui/SummusLogo'

export const PROFILE_OPTIONS: Array<{
  label: UserProfile
  labelKey: TranslationKey
  icon: LucideIcon
  color: string
}> = [
  { label: 'Clínica', labelKey: 'onboarding.clinic', icon: Stethoscope, color: '#3B82F6' },
  { label: 'Med Spa', labelKey: 'onboarding.medSpa', icon: Sparkles, color: '#DB2777' },
  { label: 'Agência', labelKey: 'onboarding.agency', icon: Building2, color: '#8B5CF6' },
  { label: 'E-commerce', labelKey: 'onboarding.ecommerce', icon: ShoppingBag, color: '#F59E0B' },
  { label: 'Consultor', labelKey: 'onboarding.consultant', icon: UserRound, color: '#10B981' },
  { label: 'Empresário', labelKey: 'onboarding.entrepreneur', icon: Store, color: '#6366F1' },
]

type ProfileStepProps = {
  onSelectProfile: (profile: UserProfile) => void
}

export function ProfileStep({ onSelectProfile }: ProfileStepProps) {
  const { t } = useTranslation()

  return (
    <>
      <View className="mb-8 items-center gap-4">
        <SummusLogo variant="icon" centered />
        <Text className="text-center text-3xl font-bold leading-tight text-white">
          {t('onboarding.profileTitle')}
        </Text>
        <Text className="max-w-sm text-center text-base leading-6 text-white/55">
          {t('onboarding.profileSubtitle')}
        </Text>
      </View>

      <View className="gap-3">
        {PROFILE_OPTIONS.map((option) => {
          const Icon = option.icon

          return (
            <AnimatedPressable
              key={option.label}
              onPress={() => onSelectProfile(option.label)}
              haptic={false}
              className="flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${option.color}22` }}
              >
                <Icon size={20} color={option.color} />
              </View>
              <Text className="flex-1 text-base font-semibold text-white">
                {t(option.labelKey)}
              </Text>
            </AnimatedPressable>
          )
        })}
      </View>
    </>
  )
}
