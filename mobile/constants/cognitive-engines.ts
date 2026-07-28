import type { LucideIcon } from 'lucide-react-native'
import {
  Brain,
  EyeOff,
  GitBranch,
  Layers,
  Lightbulb,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
} from 'lucide-react-native'
import type { TranslationKey } from '@shared/i18n'

export type CognitiveEngineId = 'context' | 'decision' | 'blind-spot'

export type CognitiveEngine = {
  id: CognitiveEngineId
  /** English product name — keep as-is for branding. */
  name: string
  nameKey: TranslationKey
  objectiveKey: TranslationKey
  searchKeys: TranslationKey[]
  alwaysOnKey: TranslationKey
  recentSignalKey: TranslationKey
  accentColor: string
  icon: LucideIcon
}

export type CognitivePipelineStage = {
  id: string
  labelKey: TranslationKey
}

export type FutureCognitiveEngine = {
  id: string
  name: string
  descriptionKey: TranslationKey
  icon: LucideIcon
}

/** Os três motores permanentes da Meridian — operam em toda interação. */
export const COGNITIVE_ENGINES: CognitiveEngine[] = [
  {
    id: 'context',
    name: 'Context Engine',
    nameKey: 'workforce.contextName',
    objectiveKey: 'workforce.contextObjective',
    searchKeys: [
      'workforce.contextSearch0',
      'workforce.contextSearch1',
      'workforce.contextSearch2',
      'workforce.contextSearch3',
      'workforce.contextSearch4',
      'workforce.contextSearch5',
      'workforce.contextSearch6',
    ],
    alwaysOnKey: 'workforce.contextAlwaysOn',
    recentSignalKey: 'workforce.contextSignal',
    accentColor: '#3B82F6',
    icon: Layers,
  },
  {
    id: 'decision',
    name: 'Decision Engine',
    nameKey: 'workforce.decisionName',
    objectiveKey: 'workforce.decisionObjective',
    searchKeys: [
      'workforce.decisionSearch0',
      'workforce.decisionSearch1',
      'workforce.decisionSearch2',
      'workforce.decisionSearch3',
      'workforce.decisionSearch4',
      'workforce.decisionSearch5',
    ],
    alwaysOnKey: 'workforce.decisionAlwaysOn',
    recentSignalKey: 'workforce.decisionSignal',
    accentColor: '#C5A059',
    icon: Target,
  },
  {
    id: 'blind-spot',
    name: 'Blind Spot Engine',
    nameKey: 'workforce.blindName',
    objectiveKey: 'workforce.blindObjective',
    searchKeys: [
      'workforce.blindSearch0',
      'workforce.blindSearch1',
      'workforce.blindSearch2',
      'workforce.blindSearch3',
      'workforce.blindSearch4',
    ],
    alwaysOnKey: 'workforce.blindAlwaysOn',
    recentSignalKey: 'workforce.blindSignal',
    accentColor: '#EC4899',
    icon: EyeOff,
  },
]

export const COGNITIVE_PIPELINE: CognitivePipelineStage[] = [
  { id: 'input', labelKey: 'workforce.pipeInput' },
  { id: 'understanding', labelKey: 'workforce.pipeUnderstanding' },
  { id: 'engines', labelKey: 'workforce.pipeEngines' },
  { id: 'integration', labelKey: 'workforce.pipeIntegration' },
  { id: 'response', labelKey: 'workforce.pipeResponse' },
]

export const FUTURE_COGNITIVE_ENGINES: FutureCognitiveEngine[] = [
  {
    id: 'memory',
    name: 'Memory Engine',
    descriptionKey: 'workforce.futureMemoryDesc',
    icon: Brain,
  },
  {
    id: 'creativity',
    name: 'Creativity Engine',
    descriptionKey: 'workforce.futureCreativityDesc',
    icon: Lightbulb,
  },
  {
    id: 'negotiation',
    name: 'Negotiation Engine',
    descriptionKey: 'workforce.futureNegotiationDesc',
    icon: Scale,
  },
  {
    id: 'ethics',
    name: 'Ethics & Trust Engine',
    descriptionKey: 'workforce.futureEthicsDesc',
    icon: Sparkles,
  },
  {
    id: 'prediction',
    name: 'Prediction Engine',
    descriptionKey: 'workforce.futurePredictionDesc',
    icon: TrendingUp,
  },
  {
    id: 'execution',
    name: 'Execution Engine',
    descriptionKey: 'workforce.futureExecutionDesc',
    icon: Workflow,
  },
  {
    id: 'learning',
    name: 'Learning Engine',
    descriptionKey: 'workforce.futureLearningDesc',
    icon: GitBranch,
  },
]

/** Mapeamento de ações de gamificação por motor (Decision Engine executa). */
export const ENGINE_ACTION_MAP: Record<CognitiveEngineId, string> = {
  context: 'configure-crm',
  decision: 'follow-up-leads',
  'blind-spot': 'rewrite-headline',
}
