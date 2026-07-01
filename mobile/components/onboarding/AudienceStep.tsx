import { Text, View } from 'react-native'
import { Target } from 'lucide-react-native'
import { TARGET_CLIENT_LABELS } from '@shared/utils/brand-identity'
import type { TargetClientType } from '@shared/types/brand-identity'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusModalBadge } from '@/components/ui/modal'
import { OnboardingField } from './OnboardingField'

const TARGET_OPTIONS = Object.entries(TARGET_CLIENT_LABELS) as Array<[TargetClientType, string]>

type AudienceStepProps = {
  targetClientType: TargetClientType | null
  targetClientDescription: string
  onSelectTarget: (type: TargetClientType) => void
  onChangeDescription: (value: string) => void
  variant?: 'onboarding' | 'embedded'
}

export function AudienceStep({
  targetClientType,
  targetClientDescription,
  onSelectTarget,
  onChangeDescription,
  variant = 'onboarding',
}: AudienceStepProps) {
  const isEmbedded = variant === 'embedded'

  return (
    <>
      {!isEmbedded ? (
        <View className="mb-8 items-center gap-3">
          <SummusModalBadge label="Passo 2" icon={Target} tone="emerald" />
          <Text className="text-center text-2xl font-bold leading-tight text-white">
            Quem é o seu cliente ideal?
          </Text>
          <Text className="max-w-sm text-center text-base leading-6 text-white/55">
            A IA usará esse perfil para definir tom de voz, ofertas e canais nas suas campanhas.
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        {TARGET_OPTIONS.map(([type, label]) => {
          const isSelected = targetClientType === type

          return (
            <AnimatedPressable
              key={type}
              onPress={() => onSelectTarget(type)}
              haptic={false}
              className={[
                'rounded-2xl border px-4 py-3.5',
                isEmbedded
                  ? isSelected
                    ? 'border-violet-400 bg-violet-50'
                    : 'border-slate-200 bg-white'
                  : isSelected
                    ? 'border-gold bg-gold/10'
                    : 'border-white/10 bg-white/5',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-sm font-medium',
                  isEmbedded
                    ? isSelected
                      ? 'text-violet-700'
                      : 'text-slate-700'
                    : isSelected
                      ? 'text-gold'
                      : 'text-white/80',
                ].join(' ')}
              >
                {label}
              </Text>
            </AnimatedPressable>
          )
        })}
      </View>

      {targetClientType === 'outro' || targetClientDescription.length > 0 ? (
        <View className="mt-5">
          <OnboardingField
            label="Detalhes do público (opcional)"
            value={targetClientDescription}
            onChangeText={onChangeDescription}
            placeholder="Ex: Mulheres 30-50 anos, classe A/B, região da zona sul..."
            multiline
            variant={variant}
          />
        </View>
      ) : null}
    </>
  )
}
