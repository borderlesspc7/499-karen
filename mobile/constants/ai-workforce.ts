/**
 * @deprecated Prefer `@/constants/cognitive-engines`.
 * Mantido para compatibilidade com imports legados — agora espelha a Meridian.
 */
import {
  COGNITIVE_ENGINES,
  type CognitiveEngine,
} from '@/constants/cognitive-engines'
import { Brain } from 'lucide-react-native'

export type AiWorkforceAgent = CognitiveEngine

export const AI_WORKFORCE_AGENTS: AiWorkforceAgent[] = COGNITIVE_ENGINES

export const AI_WORKFORCE_HEADER_ICON = Brain
