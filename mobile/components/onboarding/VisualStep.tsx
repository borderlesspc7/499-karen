import { useState } from 'react'
import { Alert, Image, Platform, Pressable, Text, TextInput, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImagePlus, Palette } from 'lucide-react-native'
import {
  DEFAULT_BRAND_COLORS,
  normalizeHexColor,
} from '@shared/utils/brand-identity'
import type { BrandColors } from '@shared/types/brand-identity'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusModalBadge } from '@/components/ui/modal'

const COLOR_PRESETS = [
  '#3B82F6',
  '#DB2777',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
  '#0F172A',
  '#EF4444',
  '#6366F1',
] as const

type VisualStepProps = {
  logoUri: string | null
  colors: BrandColors
  onChangeLogoUri: (uri: string | null) => void
  onChangeColors: (colors: BrandColors) => void
  variant?: 'onboarding' | 'embedded'
}

type ColorFieldKey = keyof BrandColors

const COLOR_FIELD_LABELS: Record<ColorFieldKey, string> = {
  primary: 'Cor primária',
  secondary: 'Cor secundária',
  accent: 'Cor de destaque',
}

function ColorField({
  field,
  value,
  onChange,
  variant = 'onboarding',
}: {
  field: ColorFieldKey
  value: string
  onChange: (value: string) => void
  variant?: 'onboarding' | 'embedded'
}) {
  const isEmbedded = variant === 'embedded'
  const [draft, setDraft] = useState(value)

  function commitColor(nextValue: string) {
    const normalized = normalizeHexColor(nextValue, DEFAULT_BRAND_COLORS[field])
    setDraft(normalized)
    onChange(normalized)
  }

  return (
    <View className="gap-2">
      <Text
        className={`text-sm font-medium ${isEmbedded ? 'text-slate-700' : 'text-white/80'}`}
      >
        {COLOR_FIELD_LABELS[field]}
      </Text>
      <View className="flex-row items-center gap-3">
        <View
          className={`h-10 w-10 rounded-xl border ${isEmbedded ? 'border-slate-200' : 'border-white/20'}`}
          style={{ backgroundColor: value }}
        />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={() => commitColor(draft)}
          placeholder="#3B82F6"
          placeholderTextColor="#64748B"
          autoCapitalize="characters"
          maxLength={7}
          className={[
            'flex-1 rounded-2xl border px-4 py-3',
            isEmbedded
              ? 'border-slate-200 bg-white text-slate-900'
              : 'border-white/10 bg-white/5 text-white',
          ].join(' ')}
        />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <Pressable
            key={`${field}-${preset}`}
            onPress={() => commitColor(preset)}
            className={`h-7 w-7 rounded-lg border ${isEmbedded ? 'border-slate-200' : 'border-white/20'}`}
            style={{ backgroundColor: preset }}
            accessibilityLabel={`Selecionar cor ${preset}`}
          />
        ))}
      </View>
    </View>
  )
}

export function VisualStep({
  logoUri,
  colors,
  onChangeLogoUri,
  onChangeColors,
  variant = 'onboarding',
}: VisualStepProps) {
  const isEmbedded = variant === 'embedded'
  async function handlePickLogo() {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso à galeria para carregar o logo da sua marca.',
        )
        return
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets[0]?.uri) {
      onChangeLogoUri(result.assets[0].uri)
    }
  }

  function updateColor(field: ColorFieldKey, value: string) {
    onChangeColors({ ...colors, [field]: value })
  }

  return (
    <>
      {!isEmbedded ? (
        <View className="mb-8 items-center gap-3">
          <SummusModalBadge label="Passo 3" icon={Palette} tone="gold" />
          <Text className="text-center text-2xl font-bold leading-tight text-white">
            Identidade visual da marca
          </Text>
          <Text className="max-w-sm text-center text-base leading-6 text-white/55">
            Logo e cores serão usados como referência nas peças geradas pela IA.
          </Text>
        </View>
      ) : null}

      <View className="gap-6">
        <View className="items-center gap-3">
          <AnimatedPressable
            onPress={handlePickLogo}
            className={[
              'h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed',
              isEmbedded ? 'border-slate-300 bg-white' : 'border-white/20 bg-white/5',
            ].join(' ')}
          >
            {logoUri ? (
              <Image source={{ uri: logoUri }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="items-center gap-1">
                <ImagePlus size={28} color="#94A3B8" />
                <Text className={`text-xs ${isEmbedded ? 'text-slate-400' : 'text-white/40'}`}>
                  Adicionar logo
                </Text>
              </View>
            )}
          </AnimatedPressable>
          {logoUri ? (
            <Pressable onPress={() => onChangeLogoUri(null)}>
              <Text className="text-sm font-medium text-rose-500">Remover logo</Text>
            </Pressable>
          ) : (
            <Text className={`text-xs ${isEmbedded ? 'text-slate-400' : 'text-white/40'}`}>
              Opcional — PNG ou JPG recomendado
            </Text>
          )}
        </View>

        <View className="gap-5">
          <ColorField
            field="primary"
            value={colors.primary}
            onChange={(v) => updateColor('primary', v)}
            variant={variant}
          />
          <ColorField
            field="secondary"
            value={colors.secondary}
            onChange={(v) => updateColor('secondary', v)}
            variant={variant}
          />
          <ColorField
            field="accent"
            value={colors.accent}
            onChange={(v) => updateColor('accent', v)}
            variant={variant}
          />
        </View>

        <View className="flex-row overflow-hidden rounded-2xl">
          <View className="flex-1 py-4" style={{ backgroundColor: colors.primary }} />
          <View className="flex-1 py-4" style={{ backgroundColor: colors.secondary }} />
          <View className="flex-1 py-4" style={{ backgroundColor: colors.accent }} />
        </View>
      </View>
    </>
  )
}
