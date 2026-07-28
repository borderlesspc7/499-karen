export { automationTemplates } from './automation-templates'
export type { AutomationTemplate } from '../types/automation'
export {
  categoryLabels,
  priorityLabels,
  CATEGORY_IDS,
  PRIORITY_IDS,
  CATEGORY_LABEL_KEYS,
  PRIORITY_LABEL_KEYS,
  getCategoryLabel,
  getPriorityLabel,
} from './crm-config'
export {
  buildDefaultKanbanColumns,
  DEFAULT_KANBAN_COLUMN_DEFS,
  KANBAN_COLUMN_TITLE_KEYS,
  getKanbanColumnTitle,
} from './default-kanban-columns'
export type { GrowthDataPoint, ProgressMetric, ReportKpi, ReportsSnapshot } from '../types/reports'
