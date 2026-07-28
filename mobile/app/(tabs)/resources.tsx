import { useTranslation } from '@shared/contexts'
import { SummusPlaceholderScreen } from '@/components/layout/SummusPlaceholderScreen'

export default function ResourcesScreen() {
  const { t } = useTranslation()
  return (
    <SummusPlaceholderScreen
      title={t('placeholders.resourcesTitle')}
      description={t('placeholders.resourcesDesc')}
    />
  )
}
