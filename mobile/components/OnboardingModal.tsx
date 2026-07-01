import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import {
  Building2,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store,
  UserRound,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusModalBadge, SummusSheetModal } from '@/components/ui/modal'
import { useGamification } from '@shared/contexts'
import type { UserProfile } from '@shared/types/gamification'

const PROFILE_OPTIONS: Array<{ label: UserProfile; icon: LucideIcon; color: string }> = [
  { label: 'Clínica', icon: Stethoscope, color: '#3B82F6' },
  { label: 'Med Spa', icon: Sparkles, color: '#DB2777' },
  { label: 'Agência', icon: Building2, color: '#8B5CF6' },
  { label: 'E-commerce', icon: ShoppingBag, color: '#F59E0B' },
  { label: 'Consultor', icon: UserRound, color: '#10B981' },
]

const ADAPTATION_DELAY_MS = 2200

type OnboardingModalProps = {
  visible: boolean
}

export function OnboardingModal({ visible }: OnboardingModalProps) {
  const { setUserProfile } = useGamification()
  const [isAdapting, setIsAdapting] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!visible) {
      setIsAdapting(false)
      setSelectedProfile(null)
    }
  }, [visible])

  function handleSelectProfile(profile: UserProfile) {
    if (isAdapting) {
      return
    }

    setSelectedProfile(profile)
    setIsAdapting(true)

    setTimeout(() => {
      setUserProfile(profile)
      setIsAdapting(false)
    }, ADAPTATION_DELAY_MS)
  }

  return (
    <SummusSheetModal
      visible={visible}
      onClose={() => {}}
      showClose={false}
      presentationStyle="fullScreen"
    >
      <View className="flex-1 justify-center px-6">
        {isAdapting ? (
          <View className="items-center gap-6">
            <View className="relative h-24 w-24 items-center justify-center">
              <View className="absolute h-24 w-24 rounded-full border border-electricBlue/30 bg-electricBlue/10" />
              <View className="absolute h-16 w-16 rounded-full bg-electricBlue/15" />
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
            <View className="items-center gap-2">
              <Text className="text-center text-xl font-semibold text-white">
                Adaptando a inteligência para o seu perfil...
              </Text>
              <Text className="text-center text-sm text-white/50">{selectedProfile}</Text>
            </View>
          </View>
        ) : (
          <>
            <View className="mb-10 items-center gap-3">
              <SummusModalBadge label="Summus Edge" icon={Sparkles} />
              <Text className="text-center text-3xl font-bold leading-tight text-white">
                Qual é o seu perfil de negócio?
              </Text>
              <Text className="max-w-sm text-center text-base leading-6 text-white/55">
                Personalizamos missões, automações e insights para o seu modelo de crescimento.
              </Text>
            </View>

            <View className="gap-3">
              {PROFILE_OPTIONS.map((option) => {
                const Icon = option.icon

                return (
                  <AnimatedPressable
                    key={option.label}
                    onPress={() => handleSelectProfile(option.label)}
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
        )}
      </View>
    </SummusSheetModal>
  )
}
