import { Pressable, Text, View } from 'react-native'
import { Moon, Sun } from 'lucide-react-native'
import { useTheme } from '@shared/contexts'
import type { ThemeMode } from '@shared/types/theme'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Escuro', icon: Moon },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const tc = useThemeClasses()

  return (
    <View className={['gap-3 p-4', tc.card].join(' ')}>
      <View className="gap-1">
        <Text className={['text-sm font-semibold', tc.textLabel].join(' ')}>Aparência</Text>
        <Text className={['text-xs leading-5', tc.textMuted].join(' ')}>
          Escolha como a plataforma deve ser exibida em todas as telas.
        </Text>
      </View>

      <View className="flex-row gap-2">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.id

          return (
            <Pressable
              key={option.id}
              onPress={() => setTheme(option.id)}
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
              <Icon
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
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
