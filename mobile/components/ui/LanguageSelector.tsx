import { Pressable, Text, View } from 'react-native'
import { Languages } from 'lucide-react-native'
import { useLocale } from '@shared/contexts'
import type { AppLocale } from '@shared/types/locale'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const LOCALE_OPTIONS: { id: AppLocale; labelKey: 'language.portuguese' | 'language.english' }[] = [
  { id: 'pt-BR', labelKey: 'language.portuguese' },
  { id: 'en-US', labelKey: 'language.english' },
]

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale()
  const tc = useThemeClasses()

  return (
    <View className={['gap-3 p-4', tc.card].join(' ')}>
      <View className="gap-1">
        <Text className={['text-sm font-semibold', tc.textLabel].join(' ')}>
          {t('language.title')}
        </Text>
        <Text className={['text-xs leading-5', tc.textMuted].join(' ')}>
          {t('language.description')}
        </Text>
      </View>

      <View className="flex-row gap-2">
        {LOCALE_OPTIONS.map((option) => {
          const isActive = locale === option.id

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                void setLocale(option.id)
              }}
              className={[
                'flex-1 flex-row items-center justify-center gap-2 rounded-card border py-3.5',
                isActive
                  ? 'border-gold/35 bg-gold/10'
                  : tc.isDark
                    ? 'border-white/10 bg-white/5'
                    : 'border-premiumBorder bg-surface',
              ].join(' ')}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Languages
                size={16}
                color={isActive ? premiumColors.gold : tc.isDark ? '#94A3B8' : '#64748B'}
                strokeWidth={1.5}
              />
              <Text
                className={[
                  'text-sm font-semibold',
                  isActive ? 'text-gold' : tc.textSecondary,
                ].join(' ')}
              >
                {t(option.labelKey)}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
