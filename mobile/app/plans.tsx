import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Redirect, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import {
  Check,
  CreditCard,
  Lock,
  Sparkles,
} from 'lucide-react-native'
import {
  SUBSCRIPTION_PLANS,
  formatPlanPriceBrl,
} from '@shared/constants/subscription-plans'
import { useAuth, useSubscription } from '@shared/contexts'
import type { SubscriptionBillingInterval } from '@shared/types/subscription'
import { SummusLogo } from '@/components/ui/SummusLogo'
import { summusBrand } from '@/constants/summus-brand'
import { premiumColors } from '@/constants/premium-theme'
import { platformEntering } from '@/lib/platform-animation'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

/**
 * Paywall pós-cadastro / pré-onboarding.
 * Por enquanto: ao clicar em pagar, libera o acesso imediatamente (mock Stripe).
 */
export default function PlansScreen() {
  const { currentUser, isAuthLoading, signOutUser } = useAuth()
  const {
    hasActiveSubscription,
    isSubscriptionLoading,
    createCheckoutSession,
    confirmMockCheckout,
  } = useSubscription()
  const { isWebDesktop } = useResponsiveLayout()

  const plan = SUBSCRIPTION_PLANS[0]
  const [billingInterval, setBillingInterval] = useState<SubscriptionBillingInterval>('month')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const priceLabel = useMemo(() => {
    if (!plan) return ''
    if (billingInterval === 'year') {
      return `${formatPlanPriceBrl(plan.priceYearlyCents)} / ano`
    }
    return `${formatPlanPriceBrl(plan.priceMonthlyCents)} / mês`
  }, [billingInterval, plan])

  if (isAuthLoading || isSubscriptionLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: summusBrand.backgroundColor }}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    )
  }

  if (!currentUser) {
    return <Redirect href="/login" />
  }

  if (hasActiveSubscription) {
    return <Redirect href="/(tabs)" />
  }

  if (!plan) {
    return null
  }

  async function handlePaymentAndEnter() {
    if (!plan) return
    setErrorMessage('')
    setIsProcessing(true)

    try {
      const session = await createCheckoutSession({
        planId: plan.id,
        billingInterval,
        successUrl: 'https://summus.edge/plans?checkout=success',
        cancelUrl: 'https://summus.edge/plans?checkout=cancel',
      })

      await confirmMockCheckout({
        sessionId: session.sessionId,
        planId: plan.id,
        billingInterval,
      })

      router.replace('/(tabs)')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível liberar o acesso. Tente novamente.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: summusBrand.backgroundColor }}>
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName={[
            'gap-6 pb-12',
            isWebDesktop ? 'mx-auto w-full max-w-xl px-8 pt-10' : 'px-5 pt-6',
          ].join(' ')}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={platformEntering(FadeInDown.duration(420))}
            className="items-center gap-3"
          >
            <SummusLogo variant="icon" compact centered />
            <View className="flex-row items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
              <Lock size={12} color={premiumColors.gold} />
              <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
                Escolha seu plano
              </Text>
            </View>
            <Text className="text-center text-3xl font-bold text-white">
              Ative o Summus Edge
            </Text>
            <Text className="text-center text-base leading-6 text-white/70">
              Escolha o plano e toque em fazer pagamento para entrar no app.
            </Text>
          </Animated.View>

          <Animated.View
            entering={platformEntering(FadeInDown.delay(80).duration(420))}
            className="flex-row gap-2 self-center rounded-2xl border border-white/10 bg-white/5 p-1"
          >
            {(['month', 'year'] as const).map((interval) => {
              const isActive = billingInterval === interval
              return (
                <Pressable
                  key={interval}
                  onPress={() => setBillingInterval(interval)}
                  className={[
                    'rounded-xl px-4 py-2.5',
                    isActive ? 'bg-gold' : 'bg-transparent',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-sm font-semibold',
                      isActive ? 'text-navy' : 'text-white/70',
                    ].join(' ')}
                  >
                    {interval === 'month' ? 'Mensal' : 'Anual'}
                  </Text>
                </Pressable>
              )
            })}
          </Animated.View>

          <Animated.View
            entering={platformEntering(FadeInDown.delay(140).duration(420))}
            className="overflow-hidden rounded-3xl border border-gold/40 bg-white/5"
          >
            <View className="border-b border-white/10 bg-gold/15 px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={16} color={premiumColors.gold} />
                  <Text className="text-sm font-bold uppercase tracking-wider text-gold">
                    Plano {plan.name}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-white/60">Recomendado</Text>
              </View>
              <Text className="mt-2 text-2xl font-bold text-white">{plan.productName}</Text>
              <Text className="mt-1 text-sm text-white/65">{plan.tagline}</Text>
              <Text className="mt-4 text-3xl font-bold text-white">{priceLabel}</Text>
            </View>

            <View className="gap-3 px-5 py-5">
              <Text className="text-sm leading-5 text-white/75">{plan.description}</Text>
              {plan.highlights.map((item) => (
                <View key={item} className="flex-row items-start gap-3">
                  <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check size={12} color="#34d399" />
                  </View>
                  <Text className="flex-1 text-sm leading-5 text-white/85">{item}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Pressable
            onPress={handlePaymentAndEnter}
            disabled={isProcessing}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4 active:opacity-90"
          >
            {isProcessing ? (
              <ActivityIndicator color="#04122C" />
            ) : (
              <>
                <CreditCard size={18} color="#04122C" />
                <Text className="text-base font-bold text-navy">Fazer pagamento</Text>
              </>
            )}
          </Pressable>

          {errorMessage ? (
            <Text className="text-center text-sm text-rose-300">{errorMessage}</Text>
          ) : null}

          <View className="gap-2">
            <Text className="text-center text-xs leading-4 text-white/45">
              Por enquanto o pagamento libera o acesso na hora (modo demonstração).
            </Text>
            <Pressable onPress={() => signOutUser()} className="py-2">
              <Text className="text-center text-sm font-medium text-white/55">
                Sair e usar outra conta
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
