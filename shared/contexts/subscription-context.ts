import { createContext } from 'react'
import type {
  ConfirmMockCheckoutRequest,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  UserSubscription,
} from '../types/subscription'

export type SubscriptionContextValue = {
  subscription: UserSubscription | null
  isSubscriptionLoading: boolean
  isHydrated: boolean
  hasActiveSubscription: boolean
  createCheckoutSession: (
    request: CreateCheckoutSessionRequest,
  ) => Promise<CreateCheckoutSessionResponse>
  confirmMockCheckout: (request: ConfirmMockCheckoutRequest) => Promise<UserSubscription>
  openCustomerPortal: () => Promise<{ url: string | null; mode: 'mock' | 'stripe' }>
}

export const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined)
