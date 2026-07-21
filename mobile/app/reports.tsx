import { ActivityIndicator, Platform, Text, View } from 'react-native'
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react-native'
import { AppScreen } from '@/components/layout/AppScreen'
import { PageScroll } from '@/components/layout/PageScroll'
import { WebAppShell } from '@/components/layout/WebAppShell'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { ProgressList } from '@/components/ui/ProgressList'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

export default function ReportsScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { reports, isLoading, error } = useAnalyticsData()

  if (isLoading) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      </AppScreen>
    )
  }

  if (error || !reports) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-slate-500">
            {error ?? 'Não foi possível carregar os relatórios.'}
          </Text>
        </View>
      </AppScreen>
    )
  }

  const maxValue = Math.max(
    ...reports.growthChart.flatMap((item) => [item.oportunidades, item.fechamentos]),
    1,
  )

  const content = (
    <AppScreen>
      <PageScroll>
        <ScreenHeader
          badge="Inteligência de dados"
          title="Relatórios e Performance"
          description="KPIs, funil e métricas estratégicas da operação comercial."
        />

        <View className={isWebDesktop ? 'flex-row flex-wrap gap-3' : 'flex-row flex-wrap gap-3'}>
          {reports.kpis.map((kpi) => (
            <View
              key={kpi.id}
              className={[
                'rounded-3xl border border-slate-200 bg-white p-4 shadow-sm',
                isWebDesktop ? 'min-w-[220px] flex-1' : 'min-w-[46%] flex-1',
              ].join(' ')}
            >
              <Text className="text-sm font-medium text-slate-500">{kpi.label}</Text>
              <Text className="mt-2 text-2xl font-semibold text-slate-900">{kpi.value}</Text>
              <View className="mt-2 flex-row items-center gap-1">
                {kpi.changeType === 'positive' ? <ArrowUpRight size={14} color="#059669" /> : null}
                {kpi.changeType === 'negative' ? <ArrowDownRight size={14} color="#e11d48" /> : null}
                <Text
                  className={[
                    'text-xs font-medium',
                    kpi.changeType === 'positive' ? 'text-emerald-600' : '',
                    kpi.changeType === 'negative' ? 'text-rose-600' : '',
                    kpi.changeType === 'neutral' ? 'text-slate-500' : '',
                  ].join(' ')}
                >
                  {kpi.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className={isWebDesktop ? 'flex-row gap-6' : 'gap-5'}>
          <View className={isWebDesktop ? 'flex-1' : ''}>
            <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-slate-900">
                  Oportunidades vs Fechamentos
                </Text>
                <TrendingUp size={18} color="#7c3aed" />
              </View>
              <View className="gap-3">
                {reports.growthChart.map((item) => (
                  <View key={item.month}>
                    <Text className="mb-2 text-sm font-medium text-slate-600">{item.month}</Text>
                    <View className="gap-2">
                      <View className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <View
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${(item.oportunidades / maxValue) * 100}%` }}
                        />
                      </View>
                      <View className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <View
                          className="h-full rounded-full bg-slate-500"
                          style={{ width: `${(item.fechamentos / maxValue) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="mt-1 text-xs text-slate-400">
                      {item.oportunidades} oport. · {item.fechamentos} fech.
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={isWebDesktop ? 'w-[420px] shrink-0 gap-5' : 'gap-5'}>
            <ProgressList
              title="Motivos de Perda"
              description="Principais fatores que impediram o fechamento."
              items={reports.lossReasons}
            />
            <ProgressList
              title="Performance por Canal"
              description="Contribuição de cada canal no funil."
              items={reports.channelPerformance}
            />
          </View>
        </View>
      </PageScroll>
    </AppScreen>
  )

  if (Platform.OS === 'web' && isWebDesktop) {
    return <WebAppShell>{content}</WebAppShell>
  }

  return content
}
