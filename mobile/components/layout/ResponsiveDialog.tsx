import type { ReactNode } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { SummusModalCloseButton } from '@/components/ui/modal'

type ResponsiveDialogProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  maxWidthClassName?: string
  title?: string
  badge?: string
}

export function ResponsiveDialog({
  visible,
  onClose,
  children,
  maxWidthClassName = 'max-w-xl',
  title,
  badge,
}: ResponsiveDialogProps) {
  const { isWebDesktop } = useResponsiveLayout()

  return (
    <Modal
      visible={visible}
      animationType={isWebDesktop ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className={[
          'flex-1',
          isWebDesktop ? 'items-center justify-center p-6' : 'justify-end',
        ].join(' ')}
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        onPress={onClose}
      >
        <Pressable
          className={[
            'overflow-hidden border border-white/10 bg-white',
            isWebDesktop
              ? `max-h-[90%] w-full ${maxWidthClassName} rounded-3xl`
              : 'max-h-[88%] rounded-t-[28px]',
          ].join(' ')}
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: isWebDesktop ? 0.18 : 0.12,
            shadowRadius: 24,
            elevation: 16,
          }}
          onPress={(event) => event.stopPropagation()}
        >
          {!isWebDesktop ? (
            <View className="items-center pt-3">
              <View className="h-1.5 w-12 rounded-full bg-slate-200" />
            </View>
          ) : null}

          {(title || badge) && (
            <View className="flex-row items-start justify-between gap-3 border-b border-slate-100 px-6 pb-4 pt-5">
              <View className="flex-1 gap-1">
                {badge ? (
                  <Text className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    {badge}
                  </Text>
                ) : null}
                {title ? (
                  <Text className="text-xl font-bold text-slate-900">{title}</Text>
                ) : null}
              </View>
              <SummusModalCloseButton onPress={onClose} variant="light" />
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="p-6 pt-4"
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
