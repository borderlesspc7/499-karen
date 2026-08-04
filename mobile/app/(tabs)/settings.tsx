import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import {
  Building2,
  Check,
  CreditCard,
  Link2,
  LogOut,
  Mail,
  MessageCircle,
  Palette,
  Save,
  Shield,
  Users,
} from 'lucide-react-native'
import { useAuth, useGamification, useSubscription, useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import {
  formatPlanPriceBrl,
  getSubscriptionPlan,
} from '@shared/constants/subscription-plans'
import { AppScreen } from '@/components/layout/AppScreen'
import { PageScroll } from '@/components/layout/PageScroll'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { BrandIdentityEditor } from '@/components/brand/BrandIdentityEditor'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useUserSettings } from '@/hooks/useUserSettings'

type SettingsSection = 'geral' | 'marca' | 'seguranca' | 'integracoes' | 'equipe' | 'faturamento'

const SECTIONS: { id: SettingsSection; labelKey: TranslationKey; icon: typeof Building2 }[] = [
  { id: 'geral', labelKey: 'settings.navGeneral', icon: Building2 },
  { id: 'marca', labelKey: 'settings.navBrand', icon: Palette },
  { id: 'seguranca', labelKey: 'settings.navSecurity', icon: Shield },
  { id: 'integracoes', labelKey: 'settings.navIntegrations', icon: Link2 },
  { id: 'equipe', labelKey: 'settings.navTeam', icon: Users },
  { id: 'faturamento', labelKey: 'settings.navBilling', icon: CreditCard },
]

const SETTINGS_INTEGRATIONS = [
  { id: 'whatsapp' as const, nameKey: 'settings.whatsappBusiness' as TranslationKey, icon: MessageCircle },
  { id: 'email' as const, nameKey: 'settings.emailMarketing' as TranslationKey, icon: Mail },
]

export default function SettingsScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { t, locale } = useTranslation()
  const { currentUser, signOutUser } = useAuth()
  const { brandIdentity, userProfile, setBrandIdentity } = useGamification()
  const { subscription, openCustomerPortal } = useSubscription()
  const { settings, isLoading, updateIntegrations } = useUserSettings()
  const [activeSection, setActiveSection] = useState<SettingsSection>('geral')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [brandSaveTrigger, setBrandSaveTrigger] = useState(0)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  const connected = settings?.integrations ?? {
    instagram: false,
    facebook: false,
    google: false,
    whatsapp: false,
    email: false,
  }

  const teamMembers = useMemo(() => {
    if (settings?.teamMembers && settings.teamMembers.length > 0) {
      return settings.teamMembers
    }

    if (!currentUser?.email) {
      return []
    }

    return [
      {
        id: currentUser.id,
        name: currentUser.email.split('@')[0] ?? t('settings.roleAdmin'),
        role: t('settings.roleAdmin'),
        status: t('common.active'),
        email: currentUser.email,
      },
    ]
  }, [currentUser?.email, currentUser?.id, settings?.teamMembers, t])

  function handleSave() {
    if (activeSection === 'marca') {
      setBrandSaveTrigger((current) => current + 1)
      return
    }

    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  function handleBrandSaveStatusChange(status: 'idle' | 'saved') {
    setSaveStatus(status)
    if (status === 'saved') {
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  async function handleSignOut() {
    await signOutUser()
  }

  const billingPriceLabel = useMemo(() => {
    if (!subscription) {
      return t('settings.priceFallback')
    }
    const plan = getSubscriptionPlan(subscription.planId)
    if (subscription.billingInterval === 'year') {
      return t('plans.perYear', {
        price: formatPlanPriceBrl(plan.priceYearlyCents, locale),
      })
    }
    return t('plans.perMonth', {
      price: formatPlanPriceBrl(plan.priceMonthlyCents, locale),
    })
  }, [locale, subscription, t])

  const sectionNav = (
    <View className={isWebDesktop ? 'w-56 shrink-0 gap-1' : 'flex-row gap-2'}>
      {SECTIONS.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id

        return (
          <Pressable
            key={section.id}
            onPress={() => setActiveSection(section.id)}
            className={[
              'flex-row items-center gap-2 rounded-2xl border px-3 py-2',
              isActive ? 'border-violet-200 bg-white' : 'border-transparent bg-white/70',
              isWebDesktop ? 'w-full' : '',
            ].join(' ')}
          >
            <Icon size={16} color={isActive ? '#7c3aed' : '#64748b'} />
            <Text
              className={[
                'text-sm font-medium',
                isActive ? 'text-violet-700' : 'text-slate-600',
              ].join(' ')}
            >
              {t(section.labelKey)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )

  const sectionContent = (
    <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {activeSection === 'geral' ? (
        <View className="gap-4">
          <Text className="text-lg font-semibold text-slate-900">{t('settings.generalTitle')}</Text>
          <View>
            <Text className="text-sm font-medium text-slate-700">{t('settings.companyName')}</Text>
            <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Text className="text-slate-900">
                {brandIdentity?.companyName ?? t('settings.notConfigured')}
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-sm font-medium text-slate-700">{t('settings.timezone')}</Text>
            <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Text className="text-slate-900">{t('settings.timezoneValue')}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {activeSection === 'marca' ? (
        <BrandIdentityEditor
          initialIdentity={brandIdentity}
          userProfile={userProfile}
          onSave={setBrandIdentity}
          onSaveStatusChange={handleBrandSaveStatusChange}
          saveTrigger={brandSaveTrigger}
        />
      ) : null}

      {activeSection === 'seguranca' ? (
        <View className="gap-4">
          <Text className="text-lg font-semibold text-slate-900">{t('settings.navSecurity')}</Text>
          <Pressable className="rounded-2xl border border-slate-200 py-3">
            <Text className="text-center text-sm font-semibold text-slate-700">
              {t('settings.changePassword')}
            </Text>
          </Pressable>
          <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <Text className="font-medium text-slate-900">Chrome · Windows</Text>
            <Text className="mt-1 text-sm text-slate-500">{t('settings.sessionMeta')}</Text>
          </View>
        </View>
      ) : null}

      {activeSection === 'integracoes' ? (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-slate-900">{t('settings.navIntegrations')}</Text>
          {SETTINGS_INTEGRATIONS.map((integration) => {
            const Icon = integration.icon
            const isConnected = connected[integration.id]

            return (
              <View
                key={integration.id}
                className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="rounded-xl bg-white p-2">
                    <Icon size={18} color="#7c3aed" />
                  </View>
                  <Text className="font-medium text-slate-900">{t(integration.nameKey)}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    void updateIntegrations({
                      ...connected,
                      [integration.id]: !connected[integration.id],
                    })
                  }
                  className={[
                    'rounded-2xl px-3 py-2',
                    isConnected ? 'bg-white' : 'bg-violet-600',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-xs font-semibold',
                      isConnected ? 'text-slate-700' : 'text-white',
                    ].join(' ')}
                  >
                    {isConnected ? t('common.connected') : t('common.connect')}
                  </Text>
                </Pressable>
              </View>
            )
          })}
        </View>
      ) : null}

      {activeSection === 'equipe' ? (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-slate-900">{t('settings.navTeam')}</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#7c3aed" />
          ) : null}
          {teamMembers.map((member) => (
            <View key={member.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Text className="font-semibold text-slate-900">{member.name}</Text>
              <Text className="mt-1 text-sm text-slate-500">{member.role}</Text>
              <Text className="mt-2 text-xs font-medium text-emerald-700">{member.status}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {activeSection === 'faturamento' ? (
        <View className="gap-4">
          <View className="rounded-3xl bg-violet-600 p-5">
            <Text className="text-sm text-violet-100">{t('settings.currentPlan')}</Text>
            <Text className="mt-2 text-2xl font-semibold text-white">
              {subscription
                ? getSubscriptionPlan(subscription.planId).productName
                : 'Summus Edge'}
            </Text>
            <Text className="mt-1 text-sm text-violet-100">
              {subscription
                ? t('plans.planLabel', { name: getSubscriptionPlan(subscription.planId).name })
                : 'Meridian'}
            </Text>
            <Text className="mt-2 text-sm text-violet-100">{billingPriceLabel}</Text>
            <Text className="mt-3 text-xs text-violet-200">
              {t('settings.statusLabel')}{' '}
              {subscription?.status === 'active'
                ? t('common.active')
                : subscription?.status ?? t('settings.noSubscription')}
              {subscription?.mode === 'mock' ? ` ${t('settings.mockStripe')}` : ''}
            </Text>
            <Pressable
              disabled={isOpeningPortal}
              onPress={async () => {
                setIsOpeningPortal(true)
                try {
                  await openCustomerPortal()
                } finally {
                  setIsOpeningPortal(false)
                }
              }}
              className="mt-4 rounded-2xl bg-white py-3"
            >
              <Text className="text-center text-sm font-semibold text-violet-700">
                {isOpeningPortal ? t('common.opening') : t('settings.manageSubscription')}
              </Text>
            </Pressable>
          </View>
          <Text className="text-xs leading-5 text-slate-500">{t('settings.portalHint')}</Text>
        </View>
      ) : null}
    </View>
  )

  return (
    <AppScreen>
      <PageScroll>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <ScreenHeader badge={t('settings.badge')} title={t('settings.title')} />
          </View>
          <Pressable
            onPress={handleSave}
            className={[
              'rounded-2xl px-4 py-3',
              saveStatus === 'saved' ? 'bg-emerald-600' : 'bg-violet-600',
            ].join(' ')}
          >
            <View className="flex-row items-center gap-2">
              {saveStatus === 'saved' ? (
                <Check size={14} color="#ffffff" />
              ) : (
                <Save size={14} color="#ffffff" />
              )}
              <Text className="text-sm font-semibold text-white">
                {saveStatus === 'saved' ? t('common.saved') : t('common.save')}
              </Text>
            </View>
          </Pressable>
        </View>

        {isWebDesktop ? (
          <View className="flex-row gap-6">
            {sectionNav}
            {sectionContent}
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sectionNav}
            </ScrollView>
            {sectionContent}
          </>
        )}

        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 active:bg-slate-50"
        >
          <LogOut size={16} color="#64748b" />
          <Text className="text-sm font-semibold text-slate-700">{t('common.signOut')}</Text>
        </Pressable>
      </PageScroll>
    </AppScreen>
  )
}
