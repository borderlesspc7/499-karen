import { useTranslation } from '@shared/contexts'
import { SummusPlaceholderScreen } from '@/components/layout/SummusPlaceholderScreen'

export default function TasksScreen() {
  const { t } = useTranslation()
  return (
    <SummusPlaceholderScreen
      title={t('placeholders.tasksTitle')}
      description={t('placeholders.tasksDesc')}
    />
  )
}
