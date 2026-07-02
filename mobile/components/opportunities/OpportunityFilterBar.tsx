import { Pressable, ScrollView, Text, View } from 'react-native'
import type { OpportunityQuickFilter } from '@/lib/crm-lead-insights'
import { useThemeClasses } from '@/hooks/useThemeClasses'

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
  const tc = useThemeClasses()

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
              isActive ? tc.filterActive : tc.filterInactive,
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-semibold',
                isActive ? tc.filterActiveText : tc.filterInactiveText,
              ].join(' ')}
            >
              {option.label}
            </Text>
            {count > 0 ? (
              <View
                className={[
                  'min-w-[22px] items-center rounded-full px-1.5 py-0.5',
                  isActive ? tc.filterBadgeActive : tc.filterBadgeInactive,
                ].join(' ')}
              >
                <Text
                  className={[
                    'text-xs font-bold',
                    isActive ? tc.filterActiveText : tc.textMuted,
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
