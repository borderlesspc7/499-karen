/**
 * @deprecated Prefer `@/constants/cognitive-engines`.
 * Mantido para compatibilidade com imports legados — agora espelha o Cognitive Core.
 */
import {
  COGNITIVE_ENGINES,
  type CognitiveEngine,
} from '@/constants/cognitive-engines'
import { Brain } from 'lucide-react-native'

export type AiWorkforceAgent = CognitiveEngine & {
  role: string
  history: string
}

export const AI_WORKFORCE_AGENTS: AiWorkforceAgent[] = COGNITIVE_ENGINES.map(
  (engine) => ({
    ...engine,
    role: engine.objective,
    history: engine.recentSignal,
  }),
)

export const AI_WORKFORCE_HEADER_ICON = Brain
