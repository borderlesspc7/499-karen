import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BarChart3, ChevronRight, Play, Sparkles, Wrench } from 'lucide-react-native'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusSheetModal } from '@/components/ui/modal'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type BuilderForm = {
  companyName: string
  segment: string
  city: string
  services: string
  goals: string
}

const INITIAL_FORM: BuilderForm = {
  companyName: '',
  segment: '',
  city: '',
  services: '',
  goals: '',
}

const STEPS = [
  { id: 'learn', label: 'Learn', icon: Play },
  { id: 'implement', label: 'Implement', icon: Wrench },
  { id: 'grow', label: 'Grow', icon: BarChart3 },
] as const

type FlowView = 'lesson' | 'builder' | 'loading'

export type LearnImplementFlowRef = {
  openLesson: () => void
  openBuilder: () => void
}

type LearnImplementFlowProps = {
  onOpenBuilder?: () => void
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  multiline?: boolean
}) {
  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-deepBlue">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className={[
          'rounded-2xl border border-deepBlue/10 bg-[#F8FAFC] px-4 text-deepBlue',
          multiline ? 'min-h-[88px] py-3' : 'py-3.5',
        ].join(' ')}
      />
    </View>
  )
}

export const LearnImplementFlow = forwardRef<LearnImplementFlowRef, LearnImplementFlowProps>(
  function LearnImplementFlow({ onOpenBuilder }, ref) {
  const { width } = useResponsiveLayout()
  const isWideLayout = width >= 768
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [flowView, setFlowView] = useState<FlowView>('lesson')
  const [form, setForm] = useState<BuilderForm>(INITIAL_FORM)

  function openLesson() {
    setFlowView('lesson')
    setForm(INITIAL_FORM)
    setIsModalOpen(true)
  }

  function openBuilderDirectly() {
    setFlowView('builder')
    setForm(INITIAL_FORM)
    setIsModalOpen(true)
    onOpenBuilder?.()
  }

  useImperativeHandle(ref, () => ({
    openLesson,
    openBuilder: openBuilderDirectly,
  }))

  function closeModal() {
    setIsModalOpen(false)
    setFlowView('lesson')
    setForm(INITIAL_FORM)
  }

  function openBuilder() {
    setFlowView('builder')
  }

  function updateField(field: keyof BuilderForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleCreateMagic() {
    setFlowView('loading')
  }

  useEffect(() => {
    if (flowView !== 'loading') {
      return
    }

    const timer = setTimeout(() => {
      setIsModalOpen(false)
      setFlowView('lesson')
      setForm(INITIAL_FORM)
      Alert.alert(
        'Ecossistema Gerado!',
        'Pronto! O seu ecossistema foi gerado e está pronto para personalização.',
      )
    }, 2000)

    return () => clearTimeout(timer)
  }, [flowView])

  return (
    <>
      <Pressable
        onPress={openLesson}
        className="rounded-3xl bg-white p-6 active:opacity-95"
        style={{
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-deepBlue">Learn → Implement → Grow</Text>
          <ChevronRight size={20} color="#F59E0B" />
        </View>

        <View className="mt-6 flex-row items-start justify-between px-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === 1

            return (
              <View key={step.id} className="relative flex-1 items-center">
                {index < STEPS.length - 1 ? (
                  <View className="absolute left-[55%] top-5 z-0 h-0.5 w-full bg-deepBlue/10" />
                ) : null}
                <View
                  className={[
                    'relative z-10 h-10 w-10 items-center justify-center rounded-full',
                    isActive ? 'bg-gold' : 'bg-deepBlue/10',
                  ].join(' ')}
                >
                  <Icon size={17} color={isActive ? '#0F172A' : '#64748B'} />
                </View>
                <Text
                  className={[
                    'mt-2 text-center text-[11px] font-semibold',
                    isActive ? 'text-gold' : 'text-deepBlue/50',
                  ].join(' ')}
                >
                  {step.label}
                </Text>
              </View>
            )
          })}
        </View>

        <View className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-gold/10 py-3">
          <Sparkles size={14} color="#F59E0B" />
          <Text className="text-sm font-semibold text-gold">Toque para aprender e executar</Text>
        </View>
      </Pressable>

      <SummusSheetModal
        visible={isModalOpen}
        onClose={closeModal}
        badge="Growth Flow"
        badgeIcon={Sparkles}
        title={flowView === 'builder' ? 'Construtor Mágico' : 'Learn + Implement'}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {flowView === 'loading' ? (
            <View className="flex-1 items-center justify-center gap-4 px-6 py-10">
              <View className="relative h-20 w-20 items-center justify-center">
                <View className="absolute h-20 w-20 rounded-full border border-gold/30 bg-gold/10" />
                <ActivityIndicator size="large" color="#F59E0B" />
              </View>
              <Text className="text-center text-base font-medium text-white/80">
                A IA está a construir o seu negócio...
              </Text>
            </View>
          ) : flowView === 'builder' ? (
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-4 px-5 py-6"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
                <FormField
                  label="Nome da Empresa"
                  value={form.companyName}
                  onChangeText={(text) => updateField('companyName', text)}
                  placeholder="Ex: Summus Edge"
                />
                <FormField
                  label="Segmento"
                  value={form.segment}
                  onChangeText={(text) => updateField('segment', text)}
                  placeholder="Ex: Consultoria de crescimento"
                />
                <FormField
                  label="Cidade"
                  value={form.city}
                  onChangeText={(text) => updateField('city', text)}
                  placeholder="Ex: São Paulo"
                />
                <FormField
                  label="Serviços"
                  value={form.services}
                  onChangeText={(text) => updateField('services', text)}
                  placeholder="Descreva os seus principais serviços"
                  multiline
                />
                <FormField
                  label="Objetivos"
                  value={form.goals}
                  onChangeText={(text) => updateField('goals', text)}
                  placeholder="O que quer alcançar nos próximos 90 dias?"
                  multiline
                />

              <AnimatedPressable
                onPress={handleCreateMagic}
                className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4"
                style={{
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Sparkles size={18} color="#0F172A" />
                <Text className="text-base font-bold text-deepBlue">Criar Magia</Text>
              </AnimatedPressable>
            </ScrollView>
          ) : (
            <View className={isWideLayout ? 'flex-1 flex-row' : 'flex-1'}>
              <View className={isWideLayout ? 'flex-1 border-r border-white/10 p-5' : 'flex-1 p-5'}>
                <View className="flex-1 items-center justify-center rounded-3xl border border-white/10 bg-black/40">
                  <View className="h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/15">
                    <Play size={28} color="#F59E0B" fill="#F59E0B" />
                  </View>
                  <Text className="mt-4 text-center text-lg font-bold text-white">
                    O que é uma Landing Page?
                  </Text>
                  <Text className="mt-2 text-center text-sm text-white/50">
                    Vídeo da lição · 4 min
                  </Text>
                </View>
              </View>

              <View className={isWideLayout ? 'flex-1 p-5' : 'p-5'}>
                <View className="flex-1 justify-center rounded-3xl border border-gold/30 bg-gold/5 p-6">
                  <Text className="text-xl font-bold text-white">Vamos criar a sua agora</Text>
                  <Text className="mt-2 text-sm leading-5 text-white/60">
                    Aplique o que aprendeu e deixe a IA gerar a primeira versão em segundos.
                  </Text>

                  <AnimatedPressable
                    onPress={openBuilder}
                    className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4"
                    style={{
                      shadowColor: '#F59E0B',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <Sparkles size={18} color="#0F172A" />
                    <Text className="text-base font-bold text-deepBlue">
                      Gerar Estrutura com IA
                    </Text>
                  </AnimatedPressable>
                </View>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SummusSheetModal>
    </>
  )
},
)
