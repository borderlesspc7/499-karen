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
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusLogo } from '@/components/ui/SummusLogo'
import type { UserProfile } from '@shared/types/gamification'

export const PROFILE_OPTIONS: Array<{ label: UserProfile; icon: LucideIcon; color: string }> = [
  { label: 'Clínica', icon: Stethoscope, color: '#3B82F6' },
  { label: 'Med Spa', icon: Sparkles, color: '#DB2777' },
  { label: 'Agência', icon: Building2, color: '#8B5CF6' },
  { label: 'E-commerce', icon: ShoppingBag, color: '#F59E0B' },
  { label: 'Consultor', icon: UserRound, color: '#10B981' },
  { label: 'Empresário', icon: Store, color: '#6366F1' },
]

type ProfileStepProps = {
  onSelectProfile: (profile: UserProfile) => void
}

export function ProfileStep({ onSelectProfile }: ProfileStepProps) {
  return (
    <>
      <View className="mb-8 items-center gap-4">
        <SummusLogo variant="icon" centered />
        <Text className="text-center text-3xl font-bold leading-tight text-white">
          Qual é o seu perfil de negócio?
        </Text>
        <Text className="max-w-sm text-center text-base leading-6 text-white/55">
          Personalizamos missões, campanhas e insights para o seu modelo de crescimento.
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
              <Text className="flex-1 text-base font-semibold text-white">{option.label}</Text>
            </AnimatedPressable>
          )
        })}
      </View>
    </>
  )
}
