import { Platform } from 'react-native'

/** Reanimated `entering` pode deixar conteúdo invisível na web — desabilita nessa plataforma. */
export function platformEntering<T>(entering: T): T | undefined {
  return Platform.OS === 'web' ? undefined : entering
}
