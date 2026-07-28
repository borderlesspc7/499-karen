import { useTranslation } from '@shared/contexts'
import { SummusPlaceholderScreen } from '@/components/layout/SummusPlaceholderScreen'

export default function AnalyticsScreen() {
  const { t } = useTranslation()
  return (
    <SummusPlaceholderScreen
      title={t('placeholders.analyticsTitle')}
      description={t('placeholders.analyticsDesc')}
    />
  )
}
