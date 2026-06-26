import { Pressable, ScrollView, Text, View } from 'react-native'
import type { OpportunityQuickFilter } from '@/lib/crm-lead-insights'

type FilterOption = {
  id: OpportunityQuickFilter
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'quentes', label: 'Quentes' },
  { id: 'esquecidos', label: 'Esquecidos (IA)' },
  { id: 'ganhos', label: 'Ganhos' },
]

type OpportunityFilterBarProps = {
  activeFilter: OpportunityQuickFilter
  onFilterChange: (filter: OpportunityQuickFilter) => void
  counts: Record<OpportunityQuickFilter, number>
}

export function OpportunityFilterBar({
  activeFilter,
  onFilterChange,
  counts,
}: OpportunityFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.id
        const count = counts[option.id]

        return (
          <Pressable
            key={option.id}
            onPress={() => onFilterChange(option.id)}
            className={[
              'flex-row items-center gap-2 rounded-full px-4 py-2.5',
              isActive ? 'bg-deepBlue' : 'border border-slate-200 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-semibold',
                isActive ? 'text-white' : 'text-slate-600',
              ].join(' ')}
            >
              {option.label}
            </Text>
            {count > 0 ? (
              <View
                className={[
                  'min-w-[22px] items-center rounded-full px-1.5 py-0.5',
                  isActive ? 'bg-white/20' : 'bg-slate-100',
                ].join(' ')}
              >
                <Text
                  className={[
                    'text-xs font-bold',
                    isActive ? 'text-white' : 'text-slate-500',
                  ].join(' ')}
                >
                  {count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
