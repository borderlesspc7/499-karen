import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { CheckCircle2 } from 'lucide-react-native'

type SummusSuccessContentProps = {
  title: string
  message: string
  icon?: LucideIcon
  iconColor?: string
  action?: ReactNode
}

export function SummusSuccessContent({
  title,
  message,
  icon: Icon = CheckCircle2,
  iconColor = '#10B981',
  action,
}: SummusSuccessContentProps) {
  return (
    <View className="items-center p-8">
      <View className="relative h-24 w-24 items-center justify-center">
        <View className="absolute h-24 w-24 rounded-full bg-emerald/10" />
        <View className="absolute h-20 w-20 rounded-full border border-emerald/25 bg-emerald/15" />
        <Icon size={48} color={iconColor} strokeWidth={2} />
      </View>

      <Text className="mt-6 text-center text-xl font-bold text-white">{title}</Text>
      <Text className="mt-3 text-center text-sm leading-6 text-white/60">{message}</Text>

      {action ? <View className="mt-8 w-full">{action}</View> : null}
    </View>
  )
}
