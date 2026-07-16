import { EyeOff, Sparkles } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import {
  SummusModal,
  SummusModalBadge,
  SummusModalCard,
  SummusModalCloseButton,
} from '@/components/ui/modal'

type AskAiModalProps = {
  visible: boolean
  onClose: () => void
  onAccept: () => void
}

export function AskAiModal({ visible, onClose, onAccept }: AskAiModalProps) {
  return (
    <SummusModal visible={visible} onClose={onClose}>
      <SummusModalCard className="p-6">
        <View className="flex-row items-start justify-between gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl border border-[#EC4899]/25 bg-[#EC4899]/15">
            <EyeOff size={24} color="#EC4899" />
          </View>
          <SummusModalCloseButton onPress={onClose} />
        </View>

        <View className="mt-4">
          <SummusModalBadge label="Blind Spot Engine" icon={Sparkles} />
        </View>

        <Text className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#F9A8D4]">
          Interrupção do Núcleo Cognitivo
        </Text>

        <Text className="mt-4 text-base leading-7 text-white/90">
          Detectei algo que quase passou despercebido: a conversão do site caiu 12% esta semana, mas
          a premissa de que o tráfego é o problema está frágil. O contexto aponta para a headline.
          Quer que o Decision Engine reescreva agora com base nisso?
        </Text>

        <AnimatedPressable
          onPress={onAccept}
          className="mt-6 rounded-2xl bg-electricBlue py-4"
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text className="text-center text-sm font-bold text-white">
            Sim — integrar e decidir
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={onClose}
          haptic={false}
          className="mt-3 rounded-2xl border border-white/20 bg-white/5 py-4"
        >
          <Text className="text-center text-sm font-semibold text-white/75">
            Manter observação
          </Text>
        </AnimatedPressable>
      </SummusModalCard>
    </SummusModal>
  )
}
