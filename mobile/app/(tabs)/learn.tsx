import { useRef } from 'react'
import { ScrollView, Text, View } from 'react-native'
import {
  LearnImplementFlow,
  type LearnImplementFlowRef,
} from '@/components/dashboard/home/LearnImplementFlow'
import { MagicBuilderShortcut } from '@/components/dashboard/home/MagicBuilderShortcut'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export default function LearnScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const learnFlowRef = useRef<LearnImplementFlowRef>(null)

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-4',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>
            Learn & Implement
          </Text>
          <Text className={['text-sm', tc.textSecondary].join(' ')}>
            Aprenda na hora e execute com IA — sem páginas em branco.
          </Text>
        </View>

        <LearnImplementFlow ref={learnFlowRef} />
        <MagicBuilderShortcut onPress={() => learnFlowRef.current?.openBuilder()} />
      </ScrollView>
    </ThemedScreen>
  )
}
