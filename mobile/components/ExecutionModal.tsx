import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { Bot, CheckCircle2, Eye, Sparkles } from 'lucide-react-native'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusSheetModal, SummusSuccessContent } from '@/components/ui/modal'

const LOADING_DURATION_MS = 2000
const SUCCESS_DURATION_MS = 2000

type ExecutionStep = 'loading' | 'preview' | 'success'

export type ExecutionModalProps = {
  visible: boolean
  title: string
  aiSuggestion: string
  impact: string
  previewDetail?: string
  contextLabel?: string
  loadingMessage?: string
  approveLabel?: string
  successMessage?: string
  onClose: () => void
  onApprove: () => void
}

export function ExecutionModal({
  visible,
  title,
  aiSuggestion,
  impact,
  previewDetail,
  contextLabel = 'AI Workforce',
  loadingMessage = 'A AI Workforce está a analisar os dados e a criar a estratégia...',
  approveLabel = 'Aprovar e Executar',
  successMessage = 'Executado com sucesso! A acompanhar os resultados.',
  onClose,
  onApprove,
}: ExecutionModalProps) {
  const [step, setStep] = useState<ExecutionStep>('loading')
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  useEffect(() => {
    if (!visible) {
      setStep('loading')
      setIsPreviewExpanded(false)
      return
    }

    setStep('loading')
    const loadingTimer = setTimeout(() => {
      setStep('preview')
    }, LOADING_DURATION_MS)

    return () => clearTimeout(loadingTimer)
  }, [visible])

  useEffect(() => {
    if (step !== 'success') {
      return
    }

    const successTimer = setTimeout(() => {
      onClose()
    }, SUCCESS_DURATION_MS)

    return () => clearTimeout(successTimer)
  }, [step, onClose])

  function handleApprove() {
    onApprove()
    setStep('success')
  }

  function handleClose() {
    if (step === 'loading') {
      return
    }

    onClose()
  }

  return (
    <SummusSheetModal
      visible={visible}
      onClose={handleClose}
      badge={contextLabel}
      badgeIcon={Sparkles}
      badgeTone="gold"
      title={step === 'preview' ? title : undefined}
      showClose={step !== 'loading'}
      maxWidthClassName="max-w-xl"
    >
      <View className="flex-1 px-5">
        {step === 'loading' ? (
          <View className="flex-1 items-center justify-center gap-6 py-10">
            <View className="relative h-24 w-24 items-center justify-center">
              <View className="absolute h-24 w-24 rounded-full border border-electricBlue/30 bg-electricBlue/10" />
              <View className="absolute h-16 w-16 rounded-full bg-electricBlue/15" />
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
            <Text className="max-w-sm text-center text-lg font-medium leading-7 text-white/90">
              {loadingMessage}
            </Text>
          </View>
        ) : null}

        {step === 'preview' ? (
          <View className="flex-1 justify-between pb-6 pt-2">
            <View className="gap-5">
              <View className="self-start rounded-full border border-emerald/25 bg-emerald/15 px-3.5 py-2">
                <Text className="text-sm font-bold text-emerald">{impact}</Text>
              </View>

              <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl border border-electricBlue/20 bg-electricBlue/15">
                    <Bot size={18} color="#3B82F6" />
                  </View>
                  <Text className="text-sm font-semibold text-white/70">Proposta da IA</Text>
                </View>
                <Text className="text-base leading-7 text-white/90">{aiSuggestion}</Text>

                {isPreviewExpanded && previewDetail ? (
                  <View className="mt-4 rounded-2xl border border-white/10 bg-deepBlue/50 p-4">
                    <Text className="text-sm leading-6 text-white/60">{previewDetail}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="gap-3">
              <AnimatedPressable
                onPress={() => setIsPreviewExpanded((current) => !current)}
                haptic={false}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-3.5"
              >
                <Eye size={16} color="#94A3B8" />
                <Text className="text-sm font-semibold text-white/80">
                  {isPreviewExpanded ? 'Ocultar Preview' : 'Ver Preview'}
                </Text>
              </AnimatedPressable>

              <AnimatedPressable
                onPress={handleApprove}
                className="rounded-2xl bg-electricBlue py-4"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-center text-base font-bold text-white">{approveLabel}</Text>
              </AnimatedPressable>
            </View>
          </View>
        ) : null}

        {step === 'success' ? (
          <SummusSuccessContent title="Concluído!" message={successMessage} icon={CheckCircle2} />
        ) : null}
      </View>
    </SummusSheetModal>
  )
}
