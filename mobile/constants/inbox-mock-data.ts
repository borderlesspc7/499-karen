export type {
  InboxChannel,
  InboxContactStatus,
  InboxConversation,
  InboxMessage,
  InboxMessageRole,
  InboxPriority,
} from '@shared/types'

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
