import { useEffect, useState, type ReactNode } from 'react'
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { SummusModalCloseButton } from '@/components/ui/modal'

type ResponsiveDialogProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  maxWidthClassName?: string
  title?: string
  badge?: string
}

export function ResponsiveDialog({
  visible,
  onClose,
  children,
  footer,
  maxWidthClassName = 'max-w-xl',
  title,
  badge,
}: ResponsiveDialogProps) {
  const { isWebDesktop } = useResponsiveLayout()
  const insets = useSafeAreaInsets()
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const windowHeight = Dimensions.get('window').height

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0)
      return
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [visible])

  // Sheet fica acima do teclado — evita empurrar o formulário para fora da área visível.
  const availableHeight = Math.max(windowHeight - keyboardHeight, 280)
  const maxSheetHeight = Math.min(
    windowHeight * (isWebDesktop ? 0.9 : 0.92),
    availableHeight - (keyboardHeight > 0 ? 4 : isWebDesktop ? 24 : 8),
  )
  const headerReserve = (title || badge ? 76 : 28) + (!isWebDesktop ? 14 : 0)
  const footerReserve = footer ? 92 + (keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 8)) : 20
  const scrollMaxHeight = Math.max(maxSheetHeight - headerReserve - footerReserve, 140)

  function handleClose() {
    Keyboard.dismiss()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType={isWebDesktop ? 'fade' : 'slide'}
      transparent
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: isWebDesktop ? 'center' : 'flex-end',
          alignItems: isWebDesktop ? 'center' : 'stretch',
          padding: isWebDesktop ? 24 : 0,
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
        }}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={handleClose}
        />

        <View
          className={[
            'overflow-hidden border border-white/10 bg-white',
            isWebDesktop ? `w-full ${maxWidthClassName} rounded-3xl` : 'w-full rounded-t-[28px]',
          ].join(' ')}
          style={{
            maxHeight: maxSheetHeight,
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: isWebDesktop ? 0.18 : 0.12,
            shadowRadius: 24,
            elevation: 16,
          }}
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
              <SummusModalCloseButton onPress={handleClose} variant="light" />
            </View>
          )}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator
            bounces
            nestedScrollEnabled
            style={{ maxHeight: scrollMaxHeight }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            {children}
          </ScrollView>

          {footer ? (
            <View
              className="border-t border-slate-100 bg-white px-6 pt-4"
              style={{
                paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 16),
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}
