import { useTranslation } from '@shared/contexts'
import { SummusPlaceholderScreen } from '@/components/layout/SummusPlaceholderScreen'

export default function BookingsScreen() {
  const { t } = useTranslation()
  return (
    <SummusPlaceholderScreen
      title={t('placeholders.bookingsTitle')}
      description={t('placeholders.bookingsDesc')}
    />
  )
}
