export type ReportKpi = {
  id: string
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export type GrowthDataPoint = {
  month: string
  oportunidades: number
  fechamentos: number
}

export type ProgressMetric = {
  label: string
  value: number
  barClassName: string
}

export type ReportsSnapshot = {
  kpis: ReportKpi[]
  growthChart: GrowthDataPoint[]
  lossReasons: ProgressMetric[]
  channelPerformance: ProgressMetric[]
}
