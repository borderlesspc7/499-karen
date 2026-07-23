import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  getSubscriptionBackend,
  getSubscriptionPersistence,
} from '../services/subscription-backend'
import { SubscriptionContext, type SubscriptionContextValue } from './subscription-context'
import { useAuth } from './useAuth'
import type {
  ConfirmMockCheckoutRequest,
  CreateCheckoutSessionRequest,
  UserSubscription,
} from '../types/subscription'
import { isSubscriptionActive } from '../types/subscription'

type SubscriptionProviderProps = {
  children: ReactNode
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { currentUser, isAuthLoading } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!currentUser) {
      setSubscription(null)
      setIsHydrated(true)
      return
    }

    setIsHydrated(false)
    const unsubscribe = getSubscriptionPersistence().subscribe(currentUser.id, (next) => {
      setSubscription(next)
      setIsHydrated(true)
    })

    return unsubscribe
  }, [currentUser, isAuthLoading])

  const createCheckoutSession = useCallback(async (request: CreateCheckoutSessionRequest) => {
    return getSubscriptionBackend().createCheckoutSession(request)
  }, [])

  const confirmMockCheckout = useCallback(async (request: ConfirmMockCheckoutRequest) => {
    const result = await getSubscriptionBackend().confirmMockCheckout(request)
    setSubscription(result.subscription)
    return result.subscription
  }, [])

  const openCustomerPortal = useCallback(async () => {
    return getSubscriptionBackend().openCustomerPortal()
  }, [])

  const contextValue = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      isSubscriptionLoading: isAuthLoading || !isHydrated,
      isHydrated,
      hasActiveSubscription: isSubscriptionActive(subscription?.status),
      createCheckoutSession,
      confirmMockCheckout,
      openCustomerPortal,
    }),
    [
      subscription,
      isAuthLoading,
      isHydrated,
      createCheckoutSession,
      confirmMockCheckout,
      openCustomerPortal,
    ],
  )

  return (
    <SubscriptionContext.Provider value={contextValue}>{children}</SubscriptionContext.Provider>
  )
}
