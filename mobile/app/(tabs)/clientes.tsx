import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { categoryLabels, priorityLabels } from '@shared/data'
import type { ClientWithPipeline } from '@shared/types'
import { AppScreen } from '@/components/layout/AppScreen'
import { ResponsiveDialog } from '@/components/layout/ResponsiveDialog'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { loadLinkedCrmSnapshot, seedLinkedDemoData } from '@/lib/crm-client-service'

const statusStyles = {
  ativo: { label: 'Ativo', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  prospecto: { label: 'Prospecto', bg: 'bg-amber-100', text: 'text-amber-700' },
  inativo: { label: 'Inativo', bg: 'bg-slate-100', text: 'text-slate-600' },
} as const

const filters = [
  { value: 'todos' as const, label: 'Todos' },
  { value: 'ativo' as const, label: 'Ativos' },
  { value: 'prospecto' as const, label: 'Prospectos' },
  { value: 'inativo' as const, label: 'Inativos' },
]

export default function ClientesScreen() {
  const { isWebDesktop, isWebTablet } = useResponsiveLayout()
  const [statusFilter, setStatusFilter] = useState<(typeof filters)[number]['value']>('todos')
  const [clients, setClients] = useState<ClientWithPipeline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientWithPipeline | null>(null)

  const listColumns = isWebDesktop ? 3 : isWebTablet ? 2 : 1

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const snapshot = await loadLinkedCrmSnapshot()
      setClients(snapshot.clients)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar os clientes.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const filteredClients = useMemo(() => {
    if (statusFilter === 'todos') return clients
    return clients.filter((client) => client.status === statusFilter)
  }, [clients, statusFilter])

  async function handleSeedDemoData() {
    setIsSeeding(true)
    setError(null)

    try {
      const snapshot = await seedLinkedDemoData()
      setClients(snapshot.clients)
    } catch (seedError) {
      const message =
        seedError instanceof Error ? seedError.message : 'Não foi possível importar os dados demo.'
      setError(message)
    } finally {
      setIsSeeding(false)
    }
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
            <ScreenHeader
              badge="Gestão de contas"
              title="Clientes"
              description="Cadastro integrado ao funil — veja em qual etapa cada cliente está."
            />
            <View className="flex-row flex-wrap gap-2">
              {filters.map((filter) => (
                <Pressable
                  key={filter.value}
                  onPress={() => setStatusFilter(filter.value)}
                  className={[
                    'rounded-full px-4 py-2',
                    statusFilter === filter.value ? 'bg-violet-600' : 'border border-slate-200 bg-white',
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
              <Text className="mt-3 text-sm text-slate-500">Carregando clientes...</Text>
            </View>
          ) : (
            <View className="items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8">
              <Text className="text-center text-base font-medium text-slate-800">
                Nenhum cliente no Firestore
              </Text>
              <Pressable
                onPress={() => void handleSeedDemoData()}
                disabled={isSeeding}
                className="rounded-full bg-violet-600 px-5 py-3"
              >
                <Text className="font-medium text-white">
                  {isSeeding ? 'Importando...' : 'Importar dados demo'}
                </Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }: { item: ClientWithPipeline }) => {
          const status = statusStyles[item.status]

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
                <View className={`rounded-full px-3 py-1 ${status.bg}`}>
                  <Text className={`text-xs font-medium ${status.text}`}>{status.label}</Text>
                </View>
              </View>
              <Text className="mt-3 text-sm text-slate-500">{item.email}</Text>
              <Text className="mt-1 text-xs text-slate-400">Último contato: {item.lastContact}</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {item.pipelineStage ? (
                  <View className="rounded-full bg-violet-100 px-3 py-1">
                    <Text className="text-xs font-medium text-violet-700">
                      Funil: {item.pipelineStage}
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
        badge="Cliente"
        title={selectedClient?.name}
      >
        {selectedClient ? (
          <>
            <Text className="mb-4 text-sm text-slate-500">{selectedClient.company}</Text>
            <View className="gap-3">
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-medium text-slate-500">E-mail</Text>
                <Text className="mt-1 font-medium text-slate-900">{selectedClient.email}</Text>
              </View>
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-medium text-slate-500">Etapa no funil</Text>
                <Text className="mt-1 font-medium text-slate-900">
                  {selectedClient.pipelineStage ?? 'Nenhuma oportunidade vinculada'}
                </Text>
              </View>
            </View>
            <Text className="mb-3 mt-5 text-sm font-medium text-slate-700">Oportunidades no CRM</Text>
            {selectedClient.opportunities.length === 0 ? (
              <Text className="text-sm text-slate-500">Sem cards no funil.</Text>
            ) : (
              selectedClient.opportunities.map((opportunity) => (
                <View
                  key={opportunity.id}
                  className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <Text className="font-medium text-slate-900">{opportunity.title}</Text>
                  <Text className="mt-1 text-xs text-violet-700">
                    {categoryLabels[opportunity.category]} · {priorityLabels[opportunity.priority]}
                  </Text>
                </View>
              ))
            )}
            <Pressable
              onPress={() => setSelectedClient(null)}
              className="mt-6 rounded-2xl bg-violet-600 py-3"
            >
              <Text className="text-center text-sm font-semibold text-white">Fechar</Text>
            </Pressable>
          </>
        ) : null}
      </ResponsiveDialog>
    </AppScreen>
  )
}
