import type {
  ConfirmMockCheckoutRequest,
  ConfirmMockCheckoutResponse,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  UserSubscription,
} from '../types/subscription'

export type SubscriptionBackend = {
  createCheckoutSession: (
    request: CreateCheckoutSessionRequest,
  ) => Promise<CreateCheckoutSessionResponse>
  confirmMockCheckout: (
    request: ConfirmMockCheckoutRequest,
  ) => Promise<ConfirmMockCheckoutResponse>
  openCustomerPortal: () => Promise<{ url: string | null; mode: 'mock' | 'stripe' }>
}

let subscriptionBackend: SubscriptionBackend | null = null

export function configureSubscriptionBackend(backend: SubscriptionBackend) {
  subscriptionBackend = backend
}

export function getSubscriptionBackend(): SubscriptionBackend {
  if (!subscriptionBackend) {
    throw new Error(
      'Subscription backend not configured. Call configureSubscriptionBackend() at bootstrap.',
    )
  }
  return subscriptionBackend
}

export type SubscriptionListener = (subscription: UserSubscription | null) => void

export type SubscriptionPersistence = {
  subscribe: (userId: string, listener: SubscriptionListener) => () => void
  /** Apenas modo mock local (fallback sem Cloud Functions) */
  writeMockSubscription?: (userId: string, subscription: UserSubscription) => Promise<void>
}

let subscriptionPersistence: SubscriptionPersistence | null = null

export function configureSubscriptionPersistence(persistence: SubscriptionPersistence) {
  subscriptionPersistence = persistence
}

export function getSubscriptionPersistence(): SubscriptionPersistence {
  if (!subscriptionPersistence) {
    throw new Error(
      'Subscription persistence not configured. Call configureSubscriptionPersistence() at bootstrap.',
    )
  }
  return subscriptionPersistence
}
