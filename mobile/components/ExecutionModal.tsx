import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Bot, CheckCircle2, Eye, Sparkles, X } from 'lucide-react-native'

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-deepBlue">
        <View className="flex-1 px-6">
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center gap-2">
              <Sparkles size={14} color="#F59E0B" />
              <Text className="text-xs font-bold uppercase tracking-wider text-gold">
                {contextLabel}
              </Text>
            </View>
            {step !== 'loading' ? (
              <Pressable
                onPress={handleClose}
                className="rounded-full bg-white/10 p-2 active:opacity-70"
                accessibilityLabel="Fechar"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>

          {step === 'loading' ? (
            <View className="flex-1 items-center justify-center gap-6">
              <View className="h-20 w-20 items-center justify-center rounded-full border border-electricBlue/30 bg-electricBlue/10">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <Text className="max-w-sm text-center text-lg font-medium leading-7 text-white">
                {loadingMessage}
              </Text>
            </View>
          ) : null}

          {step === 'preview' ? (
            <View className="flex-1 justify-between pb-6">
              <View className="gap-5">
                <View>
                  <Text className="text-2xl font-bold text-white">{title}</Text>
                  <View className="mt-3 self-start rounded-full bg-emerald/15 px-3.5 py-2">
                    <Text className="text-sm font-bold text-emerald">{impact}</Text>
                  </View>
                </View>

                <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <View className="mb-3 flex-row items-center gap-2">
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-electricBlue/20">
                      <Bot size={18} color="#3B82F6" />
                    </View>
                    <Text className="text-sm font-semibold text-white/70">
                      Proposta da IA
                    </Text>
                  </View>
                  <Text className="text-base leading-7 text-white/90">{aiSuggestion}</Text>

                  {isPreviewExpanded && previewDetail ? (
                    <View className="mt-4 rounded-2xl border border-white/10 bg-deepBlue/40 p-4">
                      <Text className="text-sm leading-6 text-white/60">{previewDetail}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="gap-3">
                <Pressable
                  onPress={() => setIsPreviewExpanded((current) => !current)}
                  className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/20 py-3.5 active:opacity-80"
                >
                  <Eye size={16} color="#94A3B8" />
                  <Text className="text-sm font-semibold text-white/80">
                    {isPreviewExpanded ? 'Ocultar Preview' : 'Ver Preview'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleApprove}
                  className="rounded-2xl bg-electricBlue py-4 active:opacity-90"
                  style={{
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-center text-base font-bold text-white">
                    {approveLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {step === 'success' ? (
            <View className="flex-1 items-center justify-center gap-5">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-emerald/15">
                <CheckCircle2 size={52} color="#10B981" strokeWidth={2} />
              </View>
              <Text className="max-w-xs text-center text-xl font-semibold leading-7 text-white">
                {successMessage}
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  )
}
