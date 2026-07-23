import { getSubscriptionPlan } from '../constants/subscription-plans'
import type {
  SubscriptionBillingInterval,
  SubscriptionMode,
  SubscriptionPlanId,
  UserSubscription,
} from '../types/subscription'

export function buildActiveSubscription(input: {
  planId: SubscriptionPlanId
  billingInterval: SubscriptionBillingInterval
  mode: SubscriptionMode
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripeCheckoutSessionId?: string | null
  stripePriceId?: string | null
  createdAt?: string
}): UserSubscription {
  const plan = getSubscriptionPlan(input.planId)
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
    stripePriceId:
      input.stripePriceId ??
      (input.billingInterval === 'year'
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly),
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    cancelAtPeriodEnd: false,
    entitlements: plan.entitlements,
    updatedAt: now.toISOString(),
    createdAt,
  }
}

export function parseUserSubscription(value: unknown): UserSubscription | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<UserSubscription>
  if (
    typeof candidate.planId !== 'string' ||
    typeof candidate.status !== 'string' ||
    typeof candidate.mode !== 'string' ||
    typeof candidate.billingInterval !== 'string' ||
    !candidate.entitlements
  ) {
    return null
  }

  return candidate as UserSubscription
}
