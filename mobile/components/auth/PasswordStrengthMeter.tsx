import { Text, View } from 'react-native'
import {
  evaluatePasswordStrength,
  type PasswordStrengthLevel,
} from '@shared/utils/password-strength'

type PasswordStrengthMeterProps = {
  password: string
}

const LEVEL_COLORS: Record<PasswordStrengthLevel, string> = {
  empty: '#E2E8F0',
  weak: '#F43F5E',
  fair: '#F59E0B',
  good: '#3B82F6',
  strong: '#10B981',
}

const SEGMENT_THRESHOLDS = [1, 2, 3, 4] as const

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result = evaluatePasswordStrength(password)

  if (!password) {
    return null
  }

  const activeColor = LEVEL_COLORS[result.level]

  return (
    <View className="mt-2 gap-2">
      <View className="flex-row gap-1.5">
        {SEGMENT_THRESHOLDS.map((threshold) => {
          const isActive = result.score >= threshold
          return (
            <View
              key={threshold}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: isActive ? activeColor : '#E2E8F0' }}
            />
          )
        })}
      </View>
      <Text className="text-xs font-medium" style={{ color: activeColor }}>
        Força da senha: {result.label}
      </Text>
      {!result.isStrongEnough && result.feedback.length > 0 ? (
        <Text className="text-xs leading-4 text-slate-500">
          Falta: {result.feedback.join(' · ')}
        </Text>
      ) : null}
    </View>
  )
}
