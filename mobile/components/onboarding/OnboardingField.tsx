import { Text, TextInput, View } from 'react-native'

type FieldVariant = 'onboarding' | 'embedded'

type OnboardingFieldProps = {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  multiline?: boolean
  hint?: string
  variant?: FieldVariant
}

const VARIANT_STYLES: Record<
  FieldVariant,
  { label: string; input: string; hint: string }
> = {
  onboarding: {
    label: 'text-white/80',
    input: 'border-white/10 bg-white/5 text-white',
    hint: 'text-white/40',
  },
  embedded: {
    label: 'text-slate-700',
    input: 'border-slate-200 bg-white text-slate-900',
    hint: 'text-slate-400',
  },
}

export function OnboardingField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  hint,
  variant = 'onboarding',
}: OnboardingFieldProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <View>
      <Text className={`mb-1.5 text-sm font-medium ${styles.label}`}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        className={[
          'rounded-2xl border px-4 text-base',
          styles.input,
          multiline ? 'min-h-[100px] py-3' : 'py-3.5',
        ].join(' ')}
      />
      {hint ? <Text className={`mt-1.5 text-xs ${styles.hint}`}>{hint}</Text> : null}
    </View>
  )
}
