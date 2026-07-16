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

export type CognitiveEngineId = 'context' | 'decision' | 'blind-spot'

export type CognitiveEngine = {
  id: CognitiveEngineId
  name: string
  namePt: string
  objective: string
  searchesFor: string[]
  alwaysOnCopy: string
  accentColor: string
  icon: LucideIcon
  recentSignal: string
}

export type CognitivePipelineStage = {
  id: string
  label: string
}

export type FutureCognitiveEngine = {
  id: string
  name: string
  description: string
  icon: LucideIcon
}

/** Os três motores permanentes do Cognitive Core — operam em toda interação. */
export const COGNITIVE_ENGINES: CognitiveEngine[] = [
  {
    id: 'context',
    name: 'Context Engine',
    namePt: 'Motor de Contexto',
    objective:
      'Reconstruir automaticamente todo o contexto: histórico, intenção, objetivos, limitações, ambiente e o que está implícito.',
    searchesFor: [
      'histórico',
      'intenção',
      'objetivos',
      'limitações',
      'ambiente',
      'fatores externos',
      'informações implícitas',
    ],
    alwaysOnCopy: 'Toda resposta nasce daqui.',
    accentColor: '#3B82F6',
    icon: Layers,
    recentSignal: 'Reconstruiu contexto de 12 sinais implícitos nesta sessão',
  },
  {
    id: 'decision',
    name: 'Decision Engine',
    namePt: 'Motor de Decisão',
    objective:
      'Calcular consequências, cenários futuros, riscos, custo de oportunidade, reversibilidade e alternativas — para entregar uma decisão fundamentada.',
    searchesFor: [
      'consequências',
      'cenários futuros',
      'riscos',
      'custo de oportunidade',
      'reversibilidade',
      'alternativas',
    ],
    alwaysOnCopy: 'Você nunca recebe só uma resposta. Recebe uma decisão.',
    accentColor: '#C5A059',
    icon: Target,
    recentSignal: 'Avaliou 4 cenários e 2 riscos de oportunidade',
  },
  {
    id: 'blind-spot',
    name: 'Blind Spot Engine',
    namePt: 'Motor de Pontos Cegos',
    objective:
      'Procurar o que ninguém percebeu: erros de premissa, riscos invisíveis, oportunidades escondidas e contradições.',
    searchesFor: [
      'erros de premissa',
      'riscos invisíveis',
      'oportunidades escondidas',
      'variáveis negligenciadas',
      'informações contraditórias',
    ],
    alwaysOnCopy: 'Interrompe qualquer resposta se detectar algo importante.',
    accentColor: '#EC4899',
    icon: EyeOff,
    recentSignal: 'Detectou 1 premissa frágil antes da última recomendação',
  },
]

export const COGNITIVE_PIPELINE: CognitivePipelineStage[] = [
  { id: 'input', label: 'Entrada' },
  { id: 'understanding', label: 'Compreensão profunda' },
  { id: 'engines', label: 'Motores cognitivos' },
  { id: 'integration', label: 'Integração' },
  { id: 'response', label: 'Resposta' },
]

export const FUTURE_COGNITIVE_ENGINES: FutureCognitiveEngine[] = [
  {
    id: 'memory',
    name: 'Memory Engine',
    description: 'Aprendizado contínuo e memória contextual',
    icon: Brain,
  },
  {
    id: 'creativity',
    name: 'Creativity Engine',
    description: 'Geração de hipóteses e inovação',
    icon: Lightbulb,
  },
  {
    id: 'negotiation',
    name: 'Negotiation Engine',
    description: 'Estratégias de persuasão e negociação',
    icon: Scale,
  },
  {
    id: 'ethics',
    name: 'Ethics & Trust Engine',
    description: 'Avaliação ética, jurídica e reputacional',
    icon: Sparkles,
  },
  {
    id: 'prediction',
    name: 'Prediction Engine',
    description: 'Projeções e tendências',
    icon: TrendingUp,
  },
  {
    id: 'execution',
    name: 'Execution Engine',
    description: 'Transformar decisões em ações automatizadas',
    icon: Workflow,
  },
  {
    id: 'learning',
    name: 'Learning Engine',
    description: 'Adaptação com base nos resultados obtidos',
    icon: GitBranch,
  },
]

export const COGNITIVE_CORE_COPY = {
  badge: 'Cognitive Core',
  title: 'Núcleo Cognitivo',
  subtitle:
    'Um único cérebro. Três motores permanentes operam em segundo plano em absolutamente toda interação.',
  notChatbot:
    'Não é um assistente. Não é um chatbot. É um Sistema Operacional Cognitivo.',
  userSeesOne: 'O usuário enxerga apenas uma resposta. Nos bastidores, dezenas de processos rodam ao mesmo tempo.',
  alwaysOn: 'Motores permanentes — Core v1',
  futureTitle: 'Próximos motores',
  futureSubtitle:
    'Novos motores entram no núcleo sem mudar a forma como você interage com o Summus.',
} as const

/** Mapeamento de ações de gamificação por motor (Decision Engine executa). */
export const ENGINE_ACTION_MAP: Record<CognitiveEngineId, string> = {
  context: 'configure-crm',
  decision: 'follow-up-leads',
  'blind-spot': 'rewrite-headline',
}
