/**
 * Cliente de billing Stripe-shaped.
 *
 * Fluxo oficial (docs Stripe):
 * 1. createCheckoutSession → Checkout Session (mode: subscription)
 * 2. Usuário paga no Checkout (ou confirma mock in-app)
 * 3. Webhook `checkout.session.completed` / `customer.subscription.*` atualiza Firestore
 * 4. App libera acesso somente após `subscription.status` ativo no Firestore
 *
 * Sem chaves Stripe: modo mock 100% funcional (callable + fallback local).
 */
import { httpsCallable } from 'firebase/functions'
import {
  configureSubscriptionBackend,
  getSubscriptionPersistence,
  type SubscriptionBackend,
} from '@shared/services/subscription-backend'
import { getSubscriptionPlan } from '@shared/constants/subscription-plans'
import { buildActiveSubscription } from '@shared/utils/subscription-helpers'
import type {
  ConfirmMockCheckoutRequest,
  ConfirmMockCheckoutResponse,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from '@shared/types/subscription'
import { getAuth } from 'firebase/auth'
import { getFirebaseApp } from './firebase'
import { getFirebaseFunctions } from './firebase-functions'

const USE_LOCAL_MOCK =
  process.env.EXPO_PUBLIC_STRIPE_MOCK_LOCAL === '1' ||
  process.env.EXPO_PUBLIC_STRIPE_MOCK_LOCAL === 'true'

function createLocalSessionId(planId: string): string {
  return `cs_mock_${planId}_${Date.now().toString(36)}`
}

async function createCheckoutSessionLocal(
  request: CreateCheckoutSessionRequest,
): Promise<CreateCheckoutSessionResponse> {
  const plan = getSubscriptionPlan(request.planId)
  const sessionId = createLocalSessionId(plan.id)

  return {
    mode: 'mock',
    sessionId,
    checkoutUrl: null,
    requiresInAppConfirmation: true,
  }
}

async function confirmMockCheckoutLocal(
  request: ConfirmMockCheckoutRequest,
): Promise<ConfirmMockCheckoutResponse> {
  const auth = getAuth(getFirebaseApp())
  const userId = auth.currentUser?.uid
  if (!userId) {
    throw new Error('Autenticação obrigatória para confirmar o checkout.')
  }

  const subscription = buildActiveSubscription({
    planId: request.planId,
    billingInterval: request.billingInterval,
    mode: 'mock',
    stripeCheckoutSessionId: request.sessionId,
    stripeCustomerId: `cus_mock_${userId.slice(0, 8)}`,
    stripeSubscriptionId: `sub_mock_${Date.now().toString(36)}`,
  })

  const persistence = getSubscriptionPersistence()
  if (!persistence.writeMockSubscription) {
    throw new Error('Persistência mock de assinatura indisponível.')
  }

  await persistence.writeMockSubscription(userId, subscription)

  return { ok: true, subscription }
}

function createCallableBackend(): SubscriptionBackend {
  const functions = getFirebaseFunctions()

  return {
    async createCheckoutSession(request) {
      if (USE_LOCAL_MOCK) {
        return createCheckoutSessionLocal(request)
      }

      try {
        const callable = httpsCallable<CreateCheckoutSessionRequest, CreateCheckoutSessionResponse>(
          functions,
          'createCheckoutSession',
        )
        const result = await callable(request)
        return result.data
      } catch {
        // Sem Functions deployadas: fallback mock local para demos.
        return createCheckoutSessionLocal(request)
      }
    },

    async confirmMockCheckout(request) {
      if (USE_LOCAL_MOCK) {
        return confirmMockCheckoutLocal(request)
      }

      try {
        const callable = httpsCallable<ConfirmMockCheckoutRequest, ConfirmMockCheckoutResponse>(
          functions,
          'confirmMockCheckout',
        )
        const result = await callable(request)
        return result.data
      } catch {
        return confirmMockCheckoutLocal(request)
      }
    },

    async openCustomerPortal() {
      if (USE_LOCAL_MOCK) {
        return { url: null, mode: 'mock' as const }
      }

      try {
        const callable = httpsCallable<Record<string, never>, { url: string | null; mode: 'mock' | 'stripe' }>(
          functions,
          'createBillingPortalSession',
        )
        const result = await callable({})
        return result.data
      } catch {
        return { url: null, mode: 'mock' as const }
      }
    },
  }
}

export function bootstrapSubscriptionBilling() {
  configureSubscriptionBackend(createCallableBackend())
}
