export type AutomationTrigger =
  | 'new_client'
  | 'opportunity_in_proposal'
  | 'inactive_30_days'
  | 'weekly_pipeline_summary'
  | 'hot_deal_alert'

export type AutomationAction =
  | 'email_onboarding'
  | 'notify_whatsapp'
  | 'archive_lead'
  | 'send_follow_up'
  | 'send_weekly_report'

export type Automation = {
  id: string
  userId: string
  title: string
  description: string
  trigger: AutomationTrigger
  action: AutomationAction
  enabled: boolean
  runCount: number
  lastRunAt: string | null
  createdAt: string
  updatedAt: string
}

export type AutomationTemplate = {
  id: string
  title: string
  description: string
  trigger: AutomationTrigger
  action: AutomationAction
}
