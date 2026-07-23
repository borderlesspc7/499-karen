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
  ShieldCheck,
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
 * Paywall obrigatório pós-cadastro / pré-onboarding.
 * Fluxo Stripe-shaped: sessão → confirmação (mock) → libera acesso via Firestore.
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
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const [sessionId, setSessionId] = useState<string | null>(null)

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

  async function handleStartCheckout() {
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

      setSessionId(session.sessionId)

      if (session.requiresInAppConfirmation || session.mode === 'mock') {
        setStep('confirm')
        return
      }

      if (session.checkoutUrl) {
        // Produção: abrir Checkout hospedado Stripe (Linking.openURL).
        setErrorMessage('Checkout Stripe pronto — configure as chaves para abrir a URL.')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleConfirmPayment() {
    if (!plan || !sessionId) return
    setErrorMessage('')
    setIsProcessing(true)

    try {
      // Simula webhook checkout.session.completed → Firestore subscription.active
      await confirmMockCheckout({
        sessionId,
        planId: plan.id,
        billingInterval,
      })
      router.replace('/(tabs)')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Pagamento não confirmado. Tente novamente.',
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
              Antes de configurar sua marca, escolha o plano. É simples: um plano, um pagamento,
              acesso liberado.
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
                  onPress={() => {
                    setBillingInterval(interval)
                    setStep('select')
                    setSessionId(null)
                  }}
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

          {step === 'confirm' ? (
            <Animated.View
              entering={platformEntering(FadeInDown.duration(360))}
              className="gap-4 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5"
            >
              <View className="flex-row items-center gap-2">
                <CreditCard size={18} color="#34d399" />
                <Text className="text-base font-semibold text-white">Confirmar pagamento</Text>
              </View>
              <Text className="text-sm leading-5 text-white/75">
                Modo demonstração Stripe (sem cobrança real). Ao confirmar, simulamos o webhook
                oficial e liberamos seu acesso — igual ao fluxo de produção.
              </Text>
              <Pressable
                onPress={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 active:opacity-90"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#04122C" />
                ) : (
                  <>
                    <ShieldCheck size={18} color="#04122C" />
                    <Text className="text-base font-bold text-navy">
                      Pagar {priceLabel} e entrar
                    </Text>
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setStep('select')
                  setSessionId(null)
                }}
                className="py-2"
              >
                <Text className="text-center text-sm text-white/60">Voltar e revisar plano</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              onPress={handleStartCheckout}
              disabled={isProcessing}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4 active:opacity-90"
            >
              {isProcessing ? (
                <ActivityIndicator color="#04122C" />
              ) : (
                <>
                  <CreditCard size={18} color="#04122C" />
                  <Text className="text-base font-bold text-navy">Continuar para pagamento</Text>
                </>
              )}
            </Pressable>
          )}

          {errorMessage ? (
            <Text className="text-center text-sm text-rose-300">{errorMessage}</Text>
          ) : null}

          <View className="gap-2">
            <Text className="text-center text-xs leading-4 text-white/45">
              Pagamento processado via Stripe Checkout (assinatura). Sem cartão real neste ambiente
              de demonstração.
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
