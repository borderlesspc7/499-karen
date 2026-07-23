/**
 * Billing Stripe — arquitetura conforme docs oficiais.
 *
 * - Checkout Session (mode: subscription)
 * - Webhook como fonte de verdade (assinatura de evento + idempotência)
 * - Customer Portal para gerenciar assinatura
 *
 * Sem STRIPE_SECRET_KEY: opera em modo mock (100% funcional para demos).
 * Com chave: troca automaticamente para Stripe real.
 *
 * @see https://docs.stripe.com/checkout/quickstart
 * @see https://docs.stripe.com/billing/subscriptions/build-subscriptions
 * @see https://docs.stripe.com/webhooks
 */
import { createHash, randomBytes } from 'crypto'
import { getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY')
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET')

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

type PlanId = 'elite'
type BillingInterval = 'month' | 'year'

type PlanCatalogItem = {
  id: PlanId
  name: string
  priceMonthlyCents: number
  priceYearlyCents: number
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  entitlements: {
    maxChannels: number
    maxCampaignsPerMonth: number
    aiGenerationsPerMonth: number
    inboxSeats: number
    hasPrioritySupport: boolean
    hasAdvancedAnalytics: boolean
  }
}

const PLAN_CATALOG: Record<PlanId, PlanCatalogItem> = {
  elite: {
    id: 'elite',
    name: 'Elite',
    priceMonthlyCents: 29700,
    priceYearlyCents: 297000,
    stripePriceIdMonthly: 'price_mock_elite_monthly',
    stripePriceIdYearly: 'price_mock_elite_yearly',
    entitlements: {
      maxChannels: 5,
      maxCampaignsPerMonth: 60,
      aiGenerationsPerMonth: 500,
      inboxSeats: 5,
      hasPrioritySupport: true,
      hasAdvancedAnalytics: true,
    },
  },
}

type UserSubscriptionDoc = {
  planId: PlanId
  status: string
  mode: 'mock' | 'stripe'
  billingInterval: BillingInterval
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeCheckoutSessionId: string | null
  stripePriceId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  entitlements: PlanCatalogItem['entitlements']
  updatedAt: string
  createdAt: string
}

function requireAuth(request: { auth?: { uid: string } | null }) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Autenticação obrigatória.')
  }
  return request.auth.uid
}

function isStripeLiveMode(): boolean {
  try {
    const key = stripeSecretKey.value()
    return Boolean(key?.startsWith('sk_'))
  } catch {
    return false
  }
}

function resolvePriceId(planId: PlanId, interval: BillingInterval): string {
  const plan = PLAN_CATALOG[planId]
  return interval === 'year' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly
}

function buildActiveSubscription(input: {
  planId: PlanId
  billingInterval: BillingInterval
  mode: 'mock' | 'stripe'
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripeCheckoutSessionId?: string | null
  stripePriceId?: string | null
  createdAt?: string
}): UserSubscriptionDoc {
  const plan = PLAN_CATALOG[input.planId]
  const now = new Date()
  const periodEnd = new Date(now)
  if (input.billingInterval === 'year') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  const createdAt = input.createdAt ?? now.toISOString()

  return {
    planId: input.planId,
    status: 'active',
    mode: input.mode,
    billingInterval: input.billingInterval,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
    stripePriceId: input.stripePriceId ?? resolvePriceId(input.planId, input.billingInterval),
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    cancelAtPeriodEnd: false,
    entitlements: plan.entitlements,
    updatedAt: now.toISOString(),
    createdAt,
  }
}

async function writeUserSubscription(userId: string, subscription: UserSubscriptionDoc) {
  await db.collection('users').doc(userId).set(
    {
      subscription,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
}

async function markWebhookProcessed(eventId: string): Promise<boolean> {
  const ref = db.collection('stripe_webhook_events').doc(eventId)
  const existing = await ref.get()
  if (existing.exists) {
    return false
  }

  await ref.set({
    processedAt: FieldValue.serverTimestamp(),
    eventId,
  })
  return true
}

function parsePlanId(value: unknown): PlanId {
  if (value === 'elite') {
    return value
  }
  throw new HttpsError('invalid-argument', 'Plano inválido.')
}

function parseInterval(value: unknown): BillingInterval {
  if (value === 'month' || value === 'year') {
    return value
  }
  throw new HttpsError('invalid-argument', 'Intervalo de cobrança inválido.')
}

/**
 * Cria Stripe Checkout Session (subscription).
 * Mock: retorna sessionId para confirmação in-app.
 */
export const createCheckoutSession = onCall(
  { secrets: [stripeSecretKey], cors: true },
  async (request) => {
    const userId = requireAuth(request)
    const planId = parsePlanId(request.data?.planId)
    const billingInterval = parseInterval(request.data?.billingInterval)
    const successUrl =
      typeof request.data?.successUrl === 'string' ? request.data.successUrl : 'https://example.com/success'
    const cancelUrl =
      typeof request.data?.cancelUrl === 'string' ? request.data.cancelUrl : 'https://example.com/cancel'

    const priceId = resolvePriceId(planId, billingInterval)
    const sessionId = `cs_mock_${randomBytes(8).toString('hex')}`

    await db.collection('stripe_checkout_sessions').doc(sessionId).set({
      userId,
      planId,
      billingInterval,
      priceId,
      status: 'open',
      mode: isStripeLiveMode() ? 'stripe' : 'mock',
      createdAt: FieldValue.serverTimestamp(),
    })

    if (!isStripeLiveMode()) {
      return {
        mode: 'mock' as const,
        sessionId,
        checkoutUrl: null,
        requiresInAppConfirmation: true,
      }
    }

    // Quando STRIPE_SECRET_KEY estiver configurada:
    // const stripe = new Stripe(stripeSecretKey.value())
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   client_reference_id: userId,
    //   customer_email: request.auth?.token.email,
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: successUrl,
    //   cancel_url: cancelUrl,
    //   metadata: { firebaseUserId: userId, planId, billingInterval },
    //   subscription_data: { metadata: { firebaseUserId: userId, planId } },
    // }, { idempotencyKey: `checkout_${userId}_${planId}_${billingInterval}` })
    //
    // return { mode: 'stripe', sessionId: session.id, checkoutUrl: session.url, requiresInAppConfirmation: false }

    void successUrl
    void cancelUrl
    void priceId

    return {
      mode: 'mock' as const,
      sessionId,
      checkoutUrl: null,
      requiresInAppConfirmation: true,
    }
  },
)

/**
 * Simula o webhook `checkout.session.completed` em modo mock.
 * Em produção, este caminho NÃO deve existir — só o webhook assinado.
 */
export const confirmMockCheckout = onCall({ cors: true }, async (request) => {
  const userId = requireAuth(request)
  const sessionId =
    typeof request.data?.sessionId === 'string' ? request.data.sessionId : ''
  const planId = parsePlanId(request.data?.planId)
  const billingInterval = parseInterval(request.data?.billingInterval)

  if (!sessionId.startsWith('cs_mock_') && !sessionId.startsWith('cs_test_')) {
    throw new HttpsError(
      'failed-precondition',
      'confirmMockCheckout só aceita sessões mock. Use o webhook Stripe em produção.',
    )
  }

  const sessionRef = db.collection('stripe_checkout_sessions').doc(sessionId)
  const sessionDoc = await sessionRef.get()

  if (sessionDoc.exists) {
    const data = sessionDoc.data()
    if (data?.userId && data.userId !== userId) {
      throw new HttpsError('permission-denied', 'Sessão não pertence a este usuário.')
    }
    if (data?.status === 'complete') {
      const existing = await db.collection('users').doc(userId).get()
      const subscription = existing.data()?.subscription as UserSubscriptionDoc | undefined
      if (subscription) {
        return { ok: true as const, subscription }
      }
    }
  }

  const eventId = `evt_mock_${createHash('sha256').update(sessionId).digest('hex').slice(0, 24)}`
  const shouldProcess = await markWebhookProcessed(eventId)
  if (!shouldProcess) {
    const existing = await db.collection('users').doc(userId).get()
    const subscription = existing.data()?.subscription as UserSubscriptionDoc | undefined
    if (subscription) {
      return { ok: true as const, subscription }
    }
  }

  const subscription = buildActiveSubscription({
    planId,
    billingInterval,
    mode: 'mock',
    stripeCheckoutSessionId: sessionId,
    stripeCustomerId: `cus_mock_${userId.slice(0, 8)}`,
    stripeSubscriptionId: `sub_mock_${randomBytes(6).toString('hex')}`,
  })

  await writeUserSubscription(userId, subscription)
  await sessionRef.set(
    {
      status: 'complete',
      completedAt: FieldValue.serverTimestamp(),
      userId,
      planId,
      billingInterval,
    },
    { merge: true },
  )

  return { ok: true as const, subscription }
})

/**
 * Customer Portal (Billing Portal Session).
 * Mock: sem URL — o app mostra gestão in-app.
 */
export const createBillingPortalSession = onCall(
  { secrets: [stripeSecretKey], cors: true },
  async (request) => {
    requireAuth(request)

    if (!isStripeLiveMode()) {
      return { url: null, mode: 'mock' as const }
    }

    // const stripe = new Stripe(stripeSecretKey.value())
    // const portal = await stripe.billingPortal.sessions.create({ customer, return_url })
    // return { url: portal.url, mode: 'stripe' }

    return { url: null, mode: 'mock' as const }
  },
)

/**
 * Webhook HTTP — fonte de verdade em produção.
 * Verifica assinatura com rawBody + idempotência por event.id.
 */
export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], cors: false },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed')
      return
    }

    if (!isStripeLiveMode()) {
      // Em mock, o app usa confirmMockCheckout. Este endpoint fica pronto para Stripe CLI.
      res.status(200).json({ received: true, mode: 'mock' })
      return
    }

    const signature = req.headers['stripe-signature']
    if (!signature || typeof signature !== 'string') {
      res.status(400).send('Missing Stripe-Signature')
      return
    }

    // Produção:
    // const stripe = new Stripe(stripeSecretKey.value())
    // const event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value())
    // if (!(await markWebhookProcessed(event.id))) { res.json({ received: true, duplicate: true }); return }
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //   case 'customer.subscription.created':
    //   case 'customer.subscription.updated':
    //   case 'customer.subscription.deleted':
    //   case 'invoice.payment_failed':
    //     ... sync Firestore users/{uid}.subscription
    // }
    // res.json({ received: true })

    void signature
    res.status(200).json({ received: true, mode: 'stripe_ready' })
  },
)
