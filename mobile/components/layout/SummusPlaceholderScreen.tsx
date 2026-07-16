import { Text, View } from 'react-native'
import { AppScreen } from '@/components/layout/AppScreen'
import { PageScroll } from '@/components/layout/PageScroll'
import { SummusCard } from '@/components/ui/SummusCard'

type SummusPlaceholderScreenProps = {
  title: string
  description: string
}

export function SummusPlaceholderScreen({ title, description }: SummusPlaceholderScreenProps) {
  return (
    <AppScreen>
      <PageScroll contentClassName="flex-1 justify-center py-10">
        <SummusCard>
          <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            Cognitive Operating System
          </Text>
          <Text className="mt-3 text-2xl font-bold text-slate-900">{title}</Text>
          <Text className="mt-3 text-sm leading-6 text-slate-500">{description}</Text>
        </SummusCard>
      </PageScroll>
    </AppScreen>
  )
}
