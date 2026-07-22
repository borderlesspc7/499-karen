import { createElement, useMemo, useState } from 'react'
import { Modal, Platform, Pressable, Text, View } from 'react-native'
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { Calendar } from 'lucide-react-native'
import {
  formatDatePtBr,
  fromIsoDateInput,
  parseDatePtBr,
  toIsoDateInput,
} from '@/lib/input-masks'

type DatePickerFieldProps = {
  label: string
  value: string
  onChange: (datePtBr: string) => void
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const selectedDate = useMemo(() => parseDatePtBr(value) ?? new Date(), [value])
  const [isOpen, setIsOpen] = useState(false)

  function commitDate(date: Date) {
    onChange(formatDatePtBr(date))
  }

  function handleNativeChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setIsOpen(false)
    }

    if (event.type === 'dismissed' || !date) {
      return
    }

    commitDate(date)
  }

  if (Platform.OS === 'web') {
    return (
      <View className="mb-3">
        <Text className="mb-1.5 text-xs font-medium text-slate-500">{label}</Text>
        <View className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          {createElement('input', {
            type: 'date',
            value: toIsoDateInput(selectedDate),
            onChange: (event: { target: { value: string } }) => {
              const next = fromIsoDateInput(event.target.value)
              if (next) {
                commitDate(next)
              }
            },
            style: {
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 16,
              color: '#0f172a',
            },
          })}
        </View>
      </View>
    )
  }

  return (
    <View className="mb-3">
      <Text className="mb-1.5 text-xs font-medium text-slate-500">{label}</Text>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-80"
      >
        <Text className="text-base text-slate-900">{value || 'Selecionar data'}</Text>
        <Calendar size={18} color="#7c3aed" />
      </Pressable>

      {Platform.OS === 'android' && isOpen ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={handleNativeChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={isOpen} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="rounded-t-3xl bg-white px-4 pb-8 pt-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Pressable onPress={() => setIsOpen(false)} className="px-2 py-2">
                  <Text className="text-sm font-medium text-slate-500">Cancelar</Text>
                </Pressable>
                <Text className="text-sm font-semibold text-slate-900">Prazo</Text>
                <Pressable onPress={() => setIsOpen(false)} className="px-2 py-2">
                  <Text className="text-sm font-semibold text-violet-600">Concluir</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleNativeChange}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  )
}
