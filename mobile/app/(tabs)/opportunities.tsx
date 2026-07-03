import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import type { KanbanCardWithClient } from '@shared/types'
import { useGamification } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import {
  GrowthFlowList,
  LeadDetailModal,
  OpportunityFilterBar,
  PipelineValueBanner,
} from '@/components/opportunities'
import {
  buildGrowthFlowLeads,
  buildWonLeads,
  computePipelineNegotiationValue,
  filterGrowthFlowLeads,
  isForgottenLead,
  isHotLead,
  type GrowthFlowLead,
  type OpportunityQuickFilter,
} from '@/lib/crm-lead-insights'
import { loadLinkedCrmSnapshot, seedLinkedDemoData } from '@/lib/crm-client-service'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export default function OpportunitiesScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { executeAction } = useGamification()

  const [cards, setCards] = useState<KanbanCardWithClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<OpportunityQuickFilter>('todos')
  const [selectedLead, setSelectedLead] = useState<GrowthFlowLead | null>(null)

  const loadOpportunities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const snapshot = await loadLinkedCrmSnapshot()
      setCards(snapshot.cards)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar as oportunidades.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOpportunities()
  }, [loadOpportunities])

  async function handleSeedDemoData() {
    setIsSeeding(true)
    setError(null)

    try {
      const snapshot = await seedLinkedDemoData()
      setCards(snapshot.cards)
    } catch (seedError) {
      const message =
        seedError instanceof Error
          ? seedError.message
          : 'Não foi possível importar oportunidades demo.'
      setError(message)
    } finally {
      setIsSeeding(false)
    }
  }

  const growthFlowLeads = useMemo(() => buildGrowthFlowLeads(cards), [cards])
  const wonLeads = useMemo(() => buildWonLeads(cards), [cards])

  const filteredLeads = useMemo(
    () => filterGrowthFlowLeads(growthFlowLeads, wonLeads, activeFilter),
    [growthFlowLeads, wonLeads, activeFilter],
  )

  const pipelineValue = useMemo(
    () => computePipelineNegotiationValue(growthFlowLeads),
    [growthFlowLeads],
  )

  const filterCounts = useMemo(
    () => ({
      todos: growthFlowLeads.length,
      quentes: growthFlowLeads.filter((lead) => isHotLead(lead, lead.healthScore)).length,
      esquecidos: growthFlowLeads.filter((lead) =>
        isForgottenLead(lead, lead.healthScore),
      ).length,
      ganhos: wonLeads.length,
    }),
    [growthFlowLeads, wonLeads],
  )

  if (isLoading && cards.length === 0) {
    return (
      <ThemedScreen className="items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={['mt-3 text-sm', tc.textSecondary].join(' ')}>
          A IA está priorizando as suas oportunidades...
        </Text>
      </ThemedScreen>
    )
  }

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-6',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => void loadOpportunities()} />
        }
        showsVerticalScrollIndicator={false}
      >
        <DesktopContent maxWidth="7xl" className="gap-6">
        <View className="gap-2">
          <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
            Oportunidades
          </Text>
          <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
            Fluxo de Crescimento — cada lead com a próxima ação que mais impacta o seu faturamento.
          </Text>
        </View>

        {growthFlowLeads.length > 0 ? (
          <PipelineValueBanner value={pipelineValue} leadCount={growthFlowLeads.length} />
        ) : null}

        {cards.length > 0 ? (
          <OpportunityFilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />
        ) : null}

        {error ? (
          <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        {cards.length === 0 && !isLoading ? (
          <View className={['items-center gap-4 rounded-3xl p-8', tc.emptyState].join(' ')}>
            <Text className={['text-center text-base font-medium', tc.textPrimary].join(' ')}>
              Nenhuma oportunidade encontrada ainda
            </Text>
            <Pressable
              onPress={() => void loadOpportunities()}
              disabled={isLoading}
              className="rounded-2xl bg-electricBlue px-5 py-3 active:opacity-80"
            >
              <Text className="font-semibold text-white">
                {isLoading ? 'Sincronizando...' : 'Sincronizar oportunidades'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void handleSeedDemoData()}
              disabled={isSeeding}
              className={['rounded-2xl border px-5 py-3 active:opacity-70', tc.isDark ? 'border-white/10' : 'border-slate-200'].join(' ')}
            >
              <Text className={['font-medium', tc.textLabel].join(' ')}>
                {isSeeding ? 'Importando...' : 'Importar dados demo'}
              </Text>
            </Pressable>
          </View>
        ) : filteredLeads.length === 0 ? (
          <View className={['rounded-3xl p-8', tc.emptyState].join(' ')}>
            <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>
              Nenhuma oportunidade neste filtro.
            </Text>
          </View>
        ) : (
          <GrowthFlowList
            leads={filteredLeads}
            onLeadPress={setSelectedLead}
            onExecuteLead={() => executeAction('follow-up-leads')}
          />
        )}
        </DesktopContent>
      </ScrollView>

      <LeadDetailModal
        lead={selectedLead}
        visible={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        onExecute={() => executeAction('follow-up-leads')}
      />
    </ThemedScreen>
  )
}
