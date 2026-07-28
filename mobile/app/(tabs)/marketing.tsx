import { useTranslation } from '@shared/contexts'
import { SummusPlaceholderScreen } from '@/components/layout/SummusPlaceholderScreen'

export default function MarketingScreen() {
  const { t } = useTranslation()
  return (
    <SummusPlaceholderScreen
      title={t('placeholders.marketingTitle')}
      description={t('placeholders.marketingDesc')}
    />
  )
}
