export type InboxChannel = 'whatsapp' | 'instagram' | 'email' | 'sms'

export type InboxPriority = 'hot' | 'warm' | 'cold'

export type InboxContactStatus = 'online' | 'away' | 'offline'

export type InboxMessageRole = 'contact' | 'agent' | 'ai'

export type InboxMessage = {
  id: string
  role: InboxMessageRole
  text: string
  timestamp: string
}

export type InboxConversation = {
  id: string
  contactName: string
  company: string
  preview: string
  channel: InboxChannel
  status: InboxContactStatus
  unreadCount: number
  updatedAt: string
  messages: InboxMessage[]
  priority: InboxPriority
  aiSummary: string
  estimatedValue: number
}

export const INBOX_QUICK_TEMPLATES = [
  'Olá! Como posso ajudar?',
  'Vou verificar e já retorno.',
  'Podemos agendar uma call esta semana?',
  'Enviei a proposta por e-mail.',
] as const

export const INBOX_SMART_REPLIES: Record<string, string[]> = {
  'conv-1': [
    'Posso reservar uma vaga esta semana?',
    'Envio o contrato agora.',
    'Qual horário funciona para você?',
  ],
  'conv-2': [
    'Sim, integramos com os principais ERPs.',
    'Posso enviar um case do seu setor.',
    'Agendamos uma demo de 15 min?',
  ],
  'conv-3': [
    'Fico no aguardo do retorno de vocês.',
    'Posso ligar amanhã para alinhar?',
    'Condição especial válida até sexta.',
  ],
  'conv-4': [
    'Ainda faz sentido conversarmos?',
    'Preparei um diagnóstico gratuito para você.',
    'Posso retomar na próxima semana?',
  ],
}

export const INBOX_AI_SUGGESTIONS: Record<string, string> = {
  'conv-1':
    'Sugestão IA: Confirmar interesse no plano Enterprise e oferecer demo de 15 min ainda hoje.',
  'conv-2':
    'Sugestão IA: Responder com case de sucesso do setor e CTA para agendar follow-up.',
  'conv-3':
    'Sugestão IA: Agradecer o e-mail e propor 3 horários para call de alinhamento.',
  'conv-4':
    'Sugestão IA: Reengajar com oferta de diagnóstico gratuito do funil de vendas.',
}

export const inboxConversations: InboxConversation[] = [
  {
    id: 'conv-1',
    contactName: 'Ana Costa',
    company: 'TechNova Solutions',
    preview: 'Podemos fechar ainda esta semana?',
    channel: 'whatsapp',
    status: 'online',
    unreadCount: 2,
    updatedAt: '14:32',
    priority: 'hot',
    aiSummary: 'Lead interessada em plano Enterprise — alta intenção de fechamento',
    estimatedValue: 4200,
    messages: [
      {
        id: 'm1',
        role: 'contact',
        text: 'Oi! Recebi a proposta e gostei do plano Enterprise.',
        timestamp: '14:10',
      },
      {
        id: 'm2',
        role: 'agent',
        text: 'Que ótimo, Ana! Posso esclarecer algum ponto da proposta?',
        timestamp: '14:15',
      },
      {
        id: 'm3',
        role: 'contact',
        text: 'Só queria confirmar o prazo de onboarding.',
        timestamp: '14:28',
      },
      {
        id: 'm4',
        role: 'contact',
        text: 'Podemos fechar ainda esta semana?',
        timestamp: '14:32',
      },
    ],
  },
  {
    id: 'conv-2',
    contactName: 'Ricardo Mendes',
    company: 'Mercado Azul Ltda',
    preview: 'Vocês atendem integração com ERP?',
    channel: 'instagram',
    status: 'away',
    unreadCount: 1,
    updatedAt: '13:05',
    priority: 'warm',
    aiSummary: 'Pergunta sobre integração ERP — enviar case técnico',
    estimatedValue: 2800,
    messages: [
      {
        id: 'm1',
        role: 'contact',
        text: 'Vi o post de vocês sobre automação de vendas.',
        timestamp: '12:40',
      },
      {
        id: 'm2',
        role: 'ai',
        text: 'Rascunho IA: Sim, integramos com os principais ERPs do mercado. Quer que eu envie o material técnico?',
        timestamp: '12:41',
      },
      {
        id: 'm3',
        role: 'contact',
        text: 'Vocês atendem integração com ERP?',
        timestamp: '13:05',
      },
    ],
  },
  {
    id: 'conv-3',
    contactName: 'Juliana Ferreira',
    company: 'Studio Criativo',
    preview: 'Re: Proposta de renovação anual',
    channel: 'email',
    status: 'offline',
    unreadCount: 0,
    updatedAt: 'Ontem',
    priority: 'warm',
    aiSummary: 'Renovação anual em análise — follow-up sexta-feira',
    estimatedValue: 3600,
    messages: [
      {
        id: 'm1',
        role: 'agent',
        text: 'Juliana, segue a proposta de renovação com condição especial de fidelidade.',
        timestamp: 'Ontem 09:12',
      },
      {
        id: 'm2',
        role: 'contact',
        text: 'Obrigada! Vou revisar com o sócio e retorno até sexta.',
        timestamp: 'Ontem 11:40',
      },
    ],
  },
  {
    id: 'conv-4',
    contactName: 'Marcos Oliveira',
    company: 'Logística Prime',
    preview: 'Ainda faz sentido retomarmos?',
    channel: 'sms',
    status: 'offline',
    unreadCount: 0,
    updatedAt: 'Seg',
    priority: 'cold',
    aiSummary: 'Lead frio — sugerir diagnóstico gratuito do funil',
    estimatedValue: 1200,
    messages: [
      {
        id: 'm1',
        role: 'agent',
        text: 'Marcos, tudo bem? Passando para retomar nossa conversa de março.',
        timestamp: 'Seg 10:00',
      },
      {
        id: 'm2',
        role: 'contact',
        text: 'Ainda faz sentido retomarmos?',
        timestamp: 'Seg 10:22',
      },
    ],
  },
]
