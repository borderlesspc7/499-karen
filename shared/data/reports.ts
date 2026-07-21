export type { GrowthDataPoint, ProgressMetric, ReportKpi, ReportsSnapshot } from '../types/reports'

/** @deprecated Use computeReportsSnapshot from analytics-service */
export const reportKpis = [] as import('../types/reports').ReportKpi[]

/** @deprecated Use computeReportsSnapshot from analytics-service */
export const growthChartData = [] as import('../types/reports').GrowthDataPoint[]

/** @deprecated Use computeReportsSnapshot from analytics-service */
export const lossReasons = [] as import('../types/reports').ProgressMetric[]

/** @deprecated Use computeReportsSnapshot from analytics-service */
export const channelPerformance = [] as import('../types/reports').ProgressMetric[]
