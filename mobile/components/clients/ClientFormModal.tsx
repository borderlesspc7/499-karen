import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useTranslation } from '@shared/contexts'
import type { Client, ClientStatus } from '@shared/types'
import { ResponsiveDialog } from '@/components/layout/ResponsiveDialog'
import { maskPhoneBr, unmaskPhoneBr } from '@/lib/input-masks'

export type ClientFormValues = {
  name: string
  company: string
  email: string
  phone: string
  status: ClientStatus
  notes: string
}

type ClientFormModalProps = {
  visible: boolean
  initialClient?: Client | null
  isSaving?: boolean
  onClose: () => void
  onSubmit: (values: ClientFormValues) => void
}

function emptyValues(): ClientFormValues {
  return {
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'prospecto',
    notes: '',
  }
}

function valuesFromClient(client: Client): ClientFormValues {
  return {
    name: client.name,
    company: client.company === '—' ? '' : client.company,
    email: client.email === '—' ? '' : client.email,
    phone: client.phone ? maskPhoneBr(client.phone) : '',
    status: client.status,
    notes: client.notes ?? '',
  }
}

export function ClientFormModal({
  visible,
  initialClient = null,
  isSaving = false,
  onClose,
  onSubmit,
}: ClientFormModalProps) {
  const { t } = useTranslation()
  const isEditing = Boolean(initialClient)
  const [values, setValues] = useState<ClientFormValues>(emptyValues)
  const [error, setError] = useState<string | null>(null)

  const statusOptions: Array<{ value: ClientStatus; label: string }> = [
    { value: 'prospecto', label: t('clients.statusProspect') },
    { value: 'ativo', label: t('clients.statusActive') },
    { value: 'inativo', label: t('clients.statusInactive') },
  ]

  useEffect(() => {
    if (!visible) {
      return
    }

    setError(null)
    setValues(initialClient ? valuesFromClient(initialClient) : emptyValues())
  }, [visible, initialClient])

  function handleSubmit() {
    if (!values.name.trim()) {
      setError(t('clients.nameRequired'))
      return
    }

    setError(null)
    onSubmit({
      ...values,
      phone: unmaskPhoneBr(values.phone),
      email: values.email.trim().toLowerCase(),
    })
  }

  return (
    <ResponsiveDialog
      visible={visible}
      onClose={onClose}
      badge={isEditing ? t('common.edit') : t('common.new')}
      title={isEditing ? t('clients.formEdit') : t('clients.formNew')}
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
              {isEditing ? t('clients.formSave') : t('clients.formNew')}
            </Text>
          )}
        </Pressable>
      }
    >
      <Text className="mb-4 text-sm text-slate-500">{t('clients.formHint')}</Text>

      {error ? (
        <View className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      <FieldLabel label={t('clients.fieldName')} />
      <TextInput
        value={values.name}
        onChangeText={(name) => setValues((current) => ({ ...current, name }))}
        placeholder="Ana Costa"
        className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
      />

      <FieldLabel label={t('clients.fieldCompany')} />
      <TextInput
        value={values.company}
        onChangeText={(company) => setValues((current) => ({ ...current, company }))}
        placeholder="Empresa Ltda"
        className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
      />

      <FieldLabel label={t('clients.fieldEmail')} />
      <TextInput
        value={values.email}
        onChangeText={(email) => setValues((current) => ({ ...current, email }))}
        placeholder="ana@empresa.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
      />

      <FieldLabel label={t('clients.fieldPhone')} />
      <TextInput
        value={values.phone}
        onChangeText={(phone) =>
          setValues((current) => ({ ...current, phone: maskPhoneBr(phone) }))
        }
        placeholder="(11) 99999-9999"
        keyboardType="phone-pad"
        className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
      />

      <FieldLabel label={t('clients.fieldStatus')} />
      <View className="mb-3 flex-row flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setValues((current) => ({ ...current, status: option.value }))}
            className={[
              'rounded-full px-4 py-2',
              values.status === option.value
                ? 'bg-violet-600'
                : 'border border-slate-200 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-sm font-medium',
                values.status === option.value ? 'text-white' : 'text-slate-600',
              ].join(' ')}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FieldLabel label={t('clients.fieldNotes')} />
      <TextInput
        value={values.notes}
        onChangeText={(notes) => setValues((current) => ({ ...current, notes }))}
        placeholder={t('clients.fieldNotesPh')}
        multiline
        className="mb-1 min-h-[88px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
        placeholderTextColor="#94a3b8"
        textAlignVertical="top"
      />
    </ResponsiveDialog>
  )
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="mb-1.5 text-xs font-medium text-slate-500">{label}</Text>
}
