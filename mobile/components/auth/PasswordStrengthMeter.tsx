import { Text, View } from 'react-native'
import { useTranslation } from '@shared/contexts'
import {
  evaluatePasswordStrength,
  PASSWORD_MIN_LENGTH,
  type PasswordFeedbackCode,
  type PasswordStrengthLevel,
} from '@shared/utils/password-strength'
import type { TranslationKey } from '@shared/i18n'

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

const FEEDBACK_KEYS: Record<PasswordFeedbackCode, TranslationKey> = {
  minLength: 'password.minLength',
  uppercase: 'password.uppercase',
  lowercase: 'password.lowercase',
  number: 'password.number',
  special: 'password.special',
}

const LEVEL_KEYS: Record<Exclude<PasswordStrengthLevel, 'empty'>, TranslationKey> = {
  weak: 'password.weak',
  fair: 'password.fair',
  good: 'password.good',
  strong: 'password.strong',
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { t } = useTranslation()
  const result = evaluatePasswordStrength(password)

  if (!password) {
    return null
  }

  const activeColor = LEVEL_COLORS[result.level]
  const levelLabel =
    result.level === 'empty' ? '' : t(LEVEL_KEYS[result.level])
  const feedbackItems = result.feedback.map((code) =>
    t(FEEDBACK_KEYS[code], code === 'minLength' ? { n: PASSWORD_MIN_LENGTH } : undefined),
  )

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
        {t('password.meterLabel', { label: levelLabel })}
      </Text>
      {!result.isStrongEnough && feedbackItems.length > 0 ? (
        <Text className="text-xs leading-4 text-slate-500">
          {t('password.missing', { items: feedbackItems.join(' · ') })}
        </Text>
      ) : null}
    </View>
  )
}
