import { useCallback, useEffect, useState } from 'react'
import { useAuth, useGamification, useTranslation } from '@shared/contexts'
import { buildRevenueKpisFromMetrics } from '@shared/services/analytics-service'
import type { ReportsSnapshot } from '@shared/types'
import type { RevenueCenterSnapshot, RevenueKpi } from '@shared/services/revenue-center'
import { loadAnalyticsData } from '@/lib/analytics-data-service'

export function useAnalyticsData() {
  const { currentUser } = useAuth()
  const { potentialRevenue, completedActions } = useGamification()
  const { t, locale } = useTranslation()
  const [revenue, setRevenue] = useState<RevenueCenterSnapshot | null>(null)
  const [reports, setReports] = useState<ReportsSnapshot | null>(null)
  const [kpis, setKpis] = useState<RevenueKpi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!currentUser?.id) {
      setRevenue(null)
      setReports(null)
      setKpis([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await loadAnalyticsData(
        currentUser.id,
        {
          potentialRevenue,
          completedActions,
        },
        locale,
      )
      setRevenue(data.revenue)
      setReports(data.reports)
      setKpis(buildRevenueKpisFromMetrics(data.revenue.dailyMetrics, locale))
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : t('reports.dataLoadError')
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [completedActions, currentUser?.id, locale, potentialRevenue, t])

  useEffect(() => {
    void load()
  }, [load])

  return { revenue, reports, kpis, isLoading, error, reload: load }
}
