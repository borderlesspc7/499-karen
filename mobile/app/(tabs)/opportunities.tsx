import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useTranslation } from '@shared/contexts'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { CrmKanbanBoard } from '@/components/crm/CrmKanbanBoard'
import {
  LeadDetailModal,
  OpportunityFormModal,
  PipelineValueBanner,
} from '@/components/opportunities'
import { useOpportunitiesScreen } from '@/hooks/useOpportunitiesScreen'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export default function OpportunitiesScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { t } = useTranslation()
  const {
    columns,
    cards,
    clients,
    isLoading,
    isSaving,
    error,
    selectedLead,
    setSelectedLead,
    activeDragCardId,
    setActiveDragCardId,
    overColumnId,
    setOverColumnId,
    isFormVisible,
    setIsFormVisible,
    editingCard,
    setEditingCard,
    growthFlowLeads,
    pipelineValue,
    executeAction,
    loadOpportunities,
    handleMoveCard,
    handleCardPress,
    openCreateForm,
    openEditFromLead,
    handleSubmitOpportunity,
    handleDeleteLead,
  } = useOpportunitiesScreen()

  if (isLoading && cards.length === 0) {
    return (
      <ThemedScreen className="items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={['mt-3 text-sm', tc.textSecondary].join(' ')}>
          {t('opportunities.loading')}
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
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-2">
              <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
                {t('opportunities.title')}
              </Text>
              <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
                {t('opportunities.subtitle')}
              </Text>
            </View>
            <Pressable
              onPress={openCreateForm}
              className="rounded-2xl bg-electricBlue px-4 py-3 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-white">{t('common.newFeminine')}</Text>
            </Pressable>
          </View>

          {growthFlowLeads.length > 0 ? (
            <PipelineValueBanner value={pipelineValue} leadCount={growthFlowLeads.length} />
          ) : null}

          {error ? (
            <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {cards.length === 0 && !isLoading ? (
            <View className={['items-center gap-4 rounded-3xl p-8', tc.emptyState].join(' ')}>
              <Text className={['text-center text-base font-medium', tc.textPrimary].join(' ')}>
                {t('opportunities.emptyTitle')}
              </Text>
              <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>
                {t('opportunities.emptyBody')}
              </Text>
              <Pressable
                onPress={openCreateForm}
                className="rounded-2xl bg-electricBlue px-5 py-3 active:opacity-80"
              >
                <Text className="font-semibold text-white">{t('opportunities.createCta')}</Text>
              </Pressable>
            </View>
          ) : (
            <CrmKanbanBoard
              columns={columns}
              cards={cards}
              onCardPress={handleCardPress}
              onMoveCard={handleMoveCard}
              activeDragCardId={activeDragCardId}
              onDragStart={setActiveDragCardId}
              onDragEnd={() => setActiveDragCardId(null)}
              overColumnId={overColumnId}
              onDragOver={setOverColumnId}
            />
          )}
        </DesktopContent>
      </ScrollView>

      <LeadDetailModal
        lead={selectedLead}
        visible={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        onExecute={() => executeAction('follow-up-leads')}
        onEdit={selectedLead ? () => openEditFromLead(selectedLead) : undefined}
        onDelete={selectedLead ? () => handleDeleteLead(selectedLead) : undefined}
      />

      <OpportunityFormModal
        visible={isFormVisible}
        columns={columns}
        clients={clients}
        initialCard={editingCard}
        isSaving={isSaving}
        onClose={() => {
          setIsFormVisible(false)
          setEditingCard(null)
        }}
        onSubmit={(values) => void handleSubmitOpportunity(values)}
      />
    </ThemedScreen>
  )
}
