import { Pressable, ScrollView, Text, View } from 'react-native'
import { useTranslation } from '@shared/contexts'
import type { OpportunityQuickFilter } from '@/lib/crm-lead-insights'
import { useThemeClasses } from '@/hooks/useThemeClasses'

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
  const { t } = useTranslation()

  const filterOptions: Array<{ id: OpportunityQuickFilter; label: string }> = [
    { id: 'todos', label: t('common.all') },
    { id: 'quentes', label: t('opportunities.filterHot') },
    { id: 'esquecidos', label: t('opportunities.filterForgotten') },
    { id: 'ganhos', label: t('opportunities.filterWon') },
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {filterOptions.map((option) => {
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
