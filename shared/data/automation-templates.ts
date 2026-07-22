import type { AutomationTemplate } from '../types/automation'

/** Catálogo de produto (definições), não dados mock de usuário. */
export const automationTemplates: AutomationTemplate[] = [
  {
    id: 'template-welcome',
    title: 'Boas-vindas a novos clientes',
    description: 'Dispara e-mail de onboarding quando um novo cliente é cadastrado.',
    trigger: 'new_client',
    action: 'email_onboarding',
  },
  {
    id: 'template-hot-deal',
    title: 'Alerta de negociação quente',
    description: 'Notifica a equipe via WhatsApp quando a oportunidade entra em Proposta.',
    trigger: 'opportunity_in_proposal',
    action: 'notify_whatsapp',
  },
  {
    id: 'template-cleanup',
    title: 'Limpeza de leads inativos',
    description: 'Arquiva leads sem interação há 30 dias.',
    trigger: 'inactive_30_days',
    action: 'archive_lead',
  },
  {
    id: 'template-follow-up',
    title: 'Follow-up pós-proposta',
    description: 'Envia lembrete automático após entrada em Proposta.',
    trigger: 'opportunity_in_proposal',
    action: 'send_follow_up',
  },
  {
    id: 'template-weekly',
    title: 'Resumo semanal de pipeline',
    description: 'Consolida métricas do funil e envia relatório toda segunda-feira.',
    trigger: 'weekly_pipeline_summary',
    action: 'send_weekly_report',
  },
]
