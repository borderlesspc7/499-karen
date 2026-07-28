import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native'
import {
  getCategoryLabel,
  getKanbanColumnTitle,
  getPriorityLabel,
} from '@shared/data'
import { useAuth, useTranslation } from '@shared/contexts'
import { getLeadSourceLabel, type ClientWithPipeline, type ClientStatus } from '@shared/types'
import { AppScreen } from '@/components/layout/AppScreen'
import { ResponsiveDialog } from '@/components/layout/ResponsiveDialog'
import { ClientFormModal, type ClientFormValues } from '@/components/clients/ClientFormModal'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import {
  createClient,
  deleteClient,
  loadLinkedCrmSnapshot,
  updateClient,
} from '@/lib/crm-client-service'

const STATUS_STYLE: Record<ClientStatus, { bg: string; text: string }> = {
  ativo: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  prospecto: { bg: 'bg-amber-100', text: 'text-amber-700' },
  inativo: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

type StatusFilter = 'todos' | ClientStatus

export default function ClientesScreen() {
  const { isWebDesktop, isWebTablet } = useResponsiveLayout()
  const { currentUser } = useAuth()
  const { t, locale } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [clients, setClients] = useState<ClientWithPipeline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientWithPipeline | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithPipeline | null>(null)

  const listColumns = isWebDesktop ? 3 : isWebTablet ? 2 : 1

  const statusLabel = useCallback(
    (status: ClientStatus) => {
      switch (status) {
        case 'ativo':
          return t('clients.statusActive')
        case 'prospecto':
          return t('clients.statusProspect')
        case 'inativo':
          return t('clients.statusInactive')
      }
    },
    [t],
  )

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: 'todos', label: t('common.all') },
    { value: 'ativo', label: t('clients.filterActive') },
    { value: 'prospecto', label: t('clients.filterProspects') },
    { value: 'inativo', label: t('clients.filterInactive') },
  ]

  const loadClients = useCallback(async () => {
    if (!currentUser?.id) {
      setClients([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const snapshot = await loadLinkedCrmSnapshot(currentUser.id)
      setClients(snapshot.clients)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : t('clients.loadError')
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id, t])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const filteredClients = useMemo(() => {
    if (statusFilter === 'todos') return clients
    return clients.filter((client) => client.status === statusFilter)
  }, [clients, statusFilter])

  function openCreateForm() {
    setEditingClient(null)
    setIsFormVisible(true)
  }

  function openEditForm(client: ClientWithPipeline) {
    setEditingClient(client)
    setSelectedClient(null)
    setIsFormVisible(true)
  }

  async function handleSubmitForm(values: ClientFormValues) {
    if (!currentUser?.id) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const snapshot = editingClient
        ? await updateClient(currentUser.id, editingClient.id, {
            name: values.name,
            company: values.company,
            email: values.email,
            phone: values.phone,
            status: values.status,
            notes: values.notes,
          })
        : await createClient({
            userId: currentUser.id,
            name: values.name,
            company: values.company,
            email: values.email,
            phone: values.phone,
            status: values.status,
            notes: values.notes,
            attribution: { source: 'manual' },
          })

      setClients(snapshot.clients)
      setIsFormVisible(false)
      setEditingClient(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('clients.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  function handleDelete(client: ClientWithPipeline) {
    if (!currentUser?.id) {
      return
    }

    Alert.alert(
      t('clients.deleteTitle'),
      t('clients.deleteMessage', { name: client.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const snapshot = await deleteClient(currentUser.id, client.id)
                setClients(snapshot.clients)
                setSelectedClient(null)
              } catch (deleteError) {
                setError(
                  deleteError instanceof Error
                    ? deleteError.message
                    : t('clients.deleteError'),
                )
              }
            })()
          },
        },
      ],
    )
  }

  function resolvePipelineStageLabel(client: ClientWithPipeline): string | null {
    const columnId = client.primaryOpportunity?.columnId
    if (!columnId) {
      return null
    }

    return getKanbanColumnTitle(t, columnId, client.pipelineStage)
  }

  return (
    <AppScreen>
      <FlatList
        data={filteredClients}
        key={listColumns}
        numColumns={listColumns}
        keyExtractor={(item) => item.id}
        columnWrapperClassName={listColumns > 1 ? 'gap-4' : undefined}
        contentContainerClassName={isWebDesktop || isWebTablet ? 'gap-4 pb-10' : 'gap-4 p-5 pb-10'}
        refreshing={isLoading}
        onRefresh={() => void loadClients()}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <ScreenHeader
                  badge={t('clients.badge')}
                  title={t('clients.title')}
                  description={t('clients.description')}
                />
              </View>
              <Pressable
                onPress={openCreateForm}
                className="rounded-2xl bg-violet-600 px-4 py-3 active:opacity-80"
              >
                <Text className="text-sm font-semibold text-white">{t('common.new')}</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {filters.map((filter) => (
                <Pressable
                  key={filter.value}
                  onPress={() => setStatusFilter(filter.value)}
                  className={[
                    'rounded-full px-4 py-2',
                    statusFilter === filter.value
                      ? 'bg-violet-600'
                      : 'border border-slate-200 bg-white',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-sm font-medium',
                      statusFilter === filter.value ? 'text-white' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {error ? (
              <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <Text className="text-sm text-red-700">{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text className="mt-3 text-sm text-slate-500">{t('clients.loading')}</Text>
            </View>
          ) : (
            <View className="items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8">
              <Text className="text-center text-base font-medium text-slate-800">
                {t('clients.emptyTitle')}
              </Text>
              <Text className="text-center text-sm text-slate-500">{t('clients.emptyBody')}</Text>
              <Pressable
                onPress={openCreateForm}
                className="rounded-full bg-violet-600 px-5 py-3"
              >
                <Text className="font-medium text-white">{t('clients.emptyCta')}</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }: { item: ClientWithPipeline }) => {
          const style = STATUS_STYLE[item.status]
          const stageLabel = resolvePipelineStageLabel(item)

          return (
            <Pressable
              onPress={() => setSelectedClient(item)}
              className={[
                'rounded-3xl border border-slate-200 bg-white p-4 shadow-sm active:border-violet-200',
                listColumns > 1 ? 'flex-1' : '',
              ].join(' ')}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                  <Text className="font-semibold text-violet-700">{item.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900">{item.name}</Text>
                  <Text className="text-sm text-slate-500">{item.company}</Text>
                </View>
                <View className={`rounded-full px-3 py-1 ${style.bg}`}>
                  <Text className={`text-xs font-medium ${style.text}`}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <Text className="mt-3 text-sm text-slate-500">{item.email}</Text>
              <Text className="mt-1 text-xs text-slate-400">
                {t('clients.sourceLastContact', {
                  source: getLeadSourceLabel(t, item.source),
                  lastContact: item.lastContact,
                })}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {stageLabel ? (
                  <View className="rounded-full bg-violet-100 px-3 py-1">
                    <Text className="text-xs font-medium text-violet-700">
                      {t('clients.funnel', { stage: stageLabel })}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          )
        }}
      />

      <ResponsiveDialog
        visible={selectedClient !== null}
        onClose={() => setSelectedClient(null)}
        badge={t('clients.detailBadge')}
        title={selectedClient?.name}
      >
        {selectedClient ? (
          <>
            <Text className="mb-4 text-sm text-slate-500">{selectedClient.company}</Text>
            <View className="gap-3">
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-medium text-slate-500">{t('clients.fieldEmail')}</Text>
                <Text className="mt-1 font-medium text-slate-900">{selectedClient.email}</Text>
              </View>
              {selectedClient.phone ? (
                <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <Text className="text-xs font-medium text-slate-500">
                    {t('clients.fieldPhone')}
                  </Text>
                  <Text className="mt-1 font-medium text-slate-900">{selectedClient.phone}</Text>
                </View>
              ) : null}
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-medium text-slate-500">{t('opportunities.source')}</Text>
                <Text className="mt-1 font-medium text-slate-900">
                  {getLeadSourceLabel(t, selectedClient.source)}
                  {selectedClient.campaignId ? ` · campanha ${selectedClient.campaignId}` : ''}
                </Text>
              </View>
              {selectedClient.notes ? (
                <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <Text className="text-xs font-medium text-slate-500">{t('clients.notes')}</Text>
                  <Text className="mt-1 font-medium text-slate-900">{selectedClient.notes}</Text>
                </View>
              ) : null}
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-medium text-slate-500">
                  {t('clients.pipelineStage')}
                </Text>
                <Text className="mt-1 font-medium text-slate-900">
                  {resolvePipelineStageLabel(selectedClient) ?? t('clients.noOpportunity')}
                </Text>
              </View>
            </View>
            <Text className="mb-3 mt-5 text-sm font-medium text-slate-700">
              {t('clients.crmOpportunities')}
            </Text>
            {selectedClient.opportunities.length === 0 ? (
              <Text className="text-sm text-slate-500">{t('clients.noCards')}</Text>
            ) : (
              selectedClient.opportunities.map((opportunity) => (
                <View
                  key={opportunity.id}
                  className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <Text className="font-medium text-slate-900">{opportunity.title}</Text>
                  <Text className="mt-1 text-xs text-violet-700">
                    {getCategoryLabel(t, opportunity.category)} ·{' '}
                    {getPriorityLabel(t, opportunity.priority)}
                    {opportunity.dealValue > 0
                      ? ` · R$ ${opportunity.dealValue.toLocaleString(locale)}`
                      : ''}
                  </Text>
                </View>
              ))
            )}
            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={() => openEditForm(selectedClient)}
                className="flex-1 rounded-2xl bg-violet-600 py-3"
              >
                <Text className="text-center text-sm font-semibold text-white">
                  {t('common.edit')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(selectedClient)}
                className="flex-1 rounded-2xl border border-red-200 bg-red-50 py-3"
              >
                <Text className="text-center text-sm font-semibold text-red-600">
                  {t('common.delete')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ResponsiveDialog>

      <ClientFormModal
        visible={isFormVisible}
        initialClient={editingClient}
        isSaving={isSaving}
        onClose={() => {
          setIsFormVisible(false)
          setEditingClient(null)
        }}
        onSubmit={(values) => void handleSubmitForm(values)}
      />
    </AppScreen>
  )
}
