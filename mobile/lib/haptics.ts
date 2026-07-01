import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export function triggerLightHaptic(): void {
  if (Platform.OS === 'web') {
    return
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export function triggerSuccessHaptic(): void {
  if (Platform.OS === 'web') {
    return
  }

  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
