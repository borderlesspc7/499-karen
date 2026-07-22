import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { categoryLabels, priorityLabels } from '@shared/data'
import type {
  Client,
  KanbanCard,
  KanbanColumn,
  TaskCategory,
  TaskPriority,
} from '@shared/types'
import { ResponsiveDialog } from '@/components/layout/ResponsiveDialog'
import { DatePickerField } from '@/components/ui/DatePickerField'
import {
  formatCurrencyInputFromNumber,
  formatDatePtBr,
  maskCurrencyBrl,
  parseCurrencyBrl,
} from '@/lib/input-masks'

export type OpportunityFormValues = {
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  clientId: string | null
  clientName: string
  dueDate: string
  columnId: string
  dealValue: string
}

type OpportunityFormModalProps = {
  visible: boolean
  columns: KanbanColumn[]
  clients: Client[]
  initialCard?: KanbanCard | null
  defaultColumnId?: string | null
  isSaving?: boolean
  onClose: () => void
  onSubmit: (values: OpportunityFormValues) => void
}

const CATEGORIES = Object.keys(categoryLabels) as TaskCategory[]
const PRIORITIES = Object.keys(priorityLabels) as TaskPriority[]

function emptyValues(columnId: string): OpportunityFormValues {
  return {
    title: '',
    description: '',
    category: 'vendas',
    priority: 'media',
    clientId: null,
    clientName: '',
    dueDate: formatDatePtBr(new Date()),
    columnId,
    dealValue: '',
  }
}

function valuesFromCard(card: KanbanCard): OpportunityFormValues {
  return {
    title: card.title,
    description: card.description,
    category: card.category,
    priority: card.priority,
    clientId: card.clientId ?? null,
    clientName: card.clientName === '—' ? '' : card.clientName,
    dueDate: card.dueDate === '—' ? formatDatePtBr(new Date()) : card.dueDate,
    columnId: card.columnId,
    dealValue: formatCurrencyInputFromNumber(card.dealValue),
  }
}

export function OpportunityFormModal({
  visible,
  columns,
  clients,
  initialCard = null,
  defaultColumnId = null,
  isSaving = false,
  onClose,
  onSubmit,
}: OpportunityFormModalProps) {
  const isEditing = Boolean(initialCard)
  const fallbackColumnId = defaultColumnId ?? columns[0]?.id ?? 'col-leads'
  const [values, setValues] = useState<OpportunityFormValues>(() => emptyValues(fallbackColumnId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) {
      return
    }

    setError(null)
    setValues(
      initialCard
        ? valuesFromCard(initialCard)
        : emptyValues(defaultColumnId ?? columns[0]?.id ?? 'col-leads'),
    )
  }, [visible, initialCard, defaultColumnId, columns])

  const sortedClients = useMemo(
    () => [...clients].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
    [clients],
  )

  function handleSelectClient(client: Client | null) {
    if (!client) {
      setValues((current) => ({ ...current, clientId: null }))
      return
    }

    setValues((current) => ({
      ...current,
      clientId: client.id,
      clientName: client.name,
    }))
  }

  function handleSubmit() {
    if (!values.title.trim()) {
      setError('Informe o título da oportunidade.')
      return
    }

    if (!values.columnId) {
      setError('Selecione uma etapa do funil.')
      return
    }

    setError(null)
    onSubmit(values)
  }

  return (
    <ResponsiveDialog
      visible={visible}
      onClose={onClose}
      badge={isEditing ? 'Editar' : 'Nova'}
      title={isEditing ? 'Editar oportunidade' : 'Nova oportunidade'}
      maxWidthClassName="max-w-2xl"
      footer={
        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          className="rounded-2xl bg-violet-600 py-3.5 active:opacity-80"
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-sm font-semibold text-white">
              {isEditing ? 'Salvar oportunidade' : 'Criar oportunidade'}
            </Text>
          )}
        </Pressable>
      }
    >
      <Text className="mb-4 text-sm text-slate-500">
        Cadastro manual agora. Depois, leads de anúncios Meta entram neste mesmo funil com origem
        “Meta Ads”.
      </Text>

      {error ? (
        <View className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      <FieldLabel label="Título *" />
      <TextInput
        value={values.title}
        onChangeText={(title) => setValues((current) => ({ ...current, title }))}
        placeholder="Proposta plano anual"
        className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
      />

      <FieldLabel label="Descrição" />
      <TextInput
        value={values.description}
        onChangeText={(description) => setValues((current) => ({ ...current, description }))}
        placeholder="Contexto do negócio..."
        multiline
        className="mb-3 min-h-[72px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
        textAlignVertical="top"
      />

      <FieldLabel label="Valor do deal" />
      <TextInput
        value={values.dealValue}
        onChangeText={(dealValue) =>
          setValues((current) => ({
            ...current,
            dealValue: maskCurrencyBrl(dealValue),
          }))
        }
        placeholder="R$ 0,00"
        keyboardType="number-pad"
        className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
      />

      <DatePickerField
        label="Prazo"
        value={values.dueDate}
        onChange={(dueDate) => setValues((current) => ({ ...current, dueDate }))}
      />

      <FieldLabel label="Etapa do funil" />
      <View className="mb-3 flex-row flex-wrap gap-2">
        {columns.map((column) => (
          <Pressable
            key={column.id}
            onPress={() => setValues((current) => ({ ...current, columnId: column.id }))}
            className={[
              'rounded-full px-4 py-2',
              values.columnId === column.id
                ? 'bg-violet-600'
                : 'border border-slate-200 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-medium',
                values.columnId === column.id ? 'text-white' : 'text-slate-600',
              ].join(' ')}
            >
              {column.title}
            </Text>
          </Pressable>
        ))}
      </View>

      <FieldLabel label="Cliente vinculado" />
      <View className="mb-3 flex-row flex-wrap gap-2">
        <Pressable
          onPress={() => handleSelectClient(null)}
          className={[
            'rounded-full px-4 py-2',
            values.clientId === null ? 'bg-violet-600' : 'border border-slate-200 bg-white',
          ].join(' ')}
        >
          <Text
            className={[
              'text-sm font-medium',
              values.clientId === null ? 'text-white' : 'text-slate-600',
            ].join(' ')}
          >
            Nenhum
          </Text>
        </Pressable>
        {sortedClients.map((client) => (
          <Pressable
            key={client.id}
            onPress={() => handleSelectClient(client)}
            className={[
              'rounded-full px-4 py-2',
              values.clientId === client.id
                ? 'bg-violet-600'
                : 'border border-slate-200 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-medium',
                values.clientId === client.id ? 'text-white' : 'text-slate-600',
              ].join(' ')}
            >
              {client.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {values.clientId === null ? (
        <>
          <FieldLabel label="Nome do contato (se sem cliente)" />
          <TextInput
            value={values.clientName}
            onChangeText={(clientName) => setValues((current) => ({ ...current, clientName }))}
            placeholder="Nome do lead"
            className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            placeholderTextColor="#94a3b8"
          />
        </>
      ) : null}

      <FieldLabel label="Categoria" />
      <View className="mb-3 flex-row flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            onPress={() => setValues((current) => ({ ...current, category }))}
            className={[
              'rounded-full px-4 py-2',
              values.category === category
                ? 'bg-violet-600'
                : 'border border-slate-200 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-medium',
                values.category === category ? 'text-white' : 'text-slate-600',
              ].join(' ')}
            >
              {categoryLabels[category]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FieldLabel label="Prioridade" />
      <View className="mb-1 flex-row flex-wrap gap-2">
        {PRIORITIES.map((priority) => (
          <Pressable
            key={priority}
            onPress={() => setValues((current) => ({ ...current, priority }))}
            className={[
              'rounded-full px-4 py-2',
              values.priority === priority
                ? 'bg-violet-600'
                : 'border border-slate-200 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-medium',
                values.priority === priority ? 'text-white' : 'text-slate-600',
              ].join(' ')}
            >
              {priorityLabels[priority]}
            </Text>
          </Pressable>
        ))}
      </View>
    </ResponsiveDialog>
  )
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="mb-1.5 text-xs font-medium text-slate-500">{label}</Text>
}

export function parseDealValueInput(raw: string): number {
  return parseCurrencyBrl(raw)
}
