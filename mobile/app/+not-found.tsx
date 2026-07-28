import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'
import { useTranslation } from '@shared/contexts'

export default function NotFoundScreen() {
  const { t } = useTranslation()

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View className="flex-1 items-center justify-center bg-slate-100 p-6">
        <Text className="text-xl font-semibold text-slate-900">{t('notFound.title')}</Text>
        <Link href="/(tabs)" className="mt-4">
          <Text className="font-semibold text-violet-600">{t('notFound.backHome')}</Text>
        </Link>
      </View>
    </>
  )
}
