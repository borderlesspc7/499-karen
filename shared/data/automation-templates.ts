import type { AutomationTemplate } from '../types/automation'

/** Catálogo de produto (definições), não dados mock de usuário. */
export const automationTemplates: AutomationTemplate[] = [
  {
    id: 'template-welcome',
    titleKey: 'automations.welcomeTitle',
    descriptionKey: 'automations.welcomeDesc',
    trigger: 'new_client',
    action: 'email_onboarding',
  },
  {
    id: 'template-hot-deal',
    titleKey: 'automations.hotDealTitle',
    descriptionKey: 'automations.hotDealDesc',
    trigger: 'opportunity_in_proposal',
    action: 'notify_whatsapp',
  },
  {
    id: 'template-cleanup',
    titleKey: 'automations.cleanupTitle',
    descriptionKey: 'automations.cleanupDesc',
    trigger: 'inactive_30_days',
    action: 'archive_lead',
  },
  {
    id: 'template-follow-up',
    titleKey: 'automations.followUpTitle',
    descriptionKey: 'automations.followUpDesc',
    trigger: 'opportunity_in_proposal',
    action: 'send_follow_up',
  },
  {
    id: 'template-weekly',
    titleKey: 'automations.weeklyTitle',
    descriptionKey: 'automations.weeklyDesc',
    trigger: 'weekly_pipeline_summary',
    action: 'send_weekly_report',
  },
]
