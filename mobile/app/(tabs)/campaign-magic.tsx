import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import Animated, { FadeInDown, SlideInRight, SlideInUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Globe, Instagram, Mail, Megaphone, Sparkles } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { ActiveCampaignsHub } from '@/components/campaign-magic/ActiveCampaignsHub'
import { ApprovalSummaryBar } from '@/components/campaign-magic/ApprovalSummaryBar'
import { AudienceStep } from '@/components/campaign-magic/AudienceStep'
import { CampaignMagicLoadingOverlay } from '@/components/campaign-magic/CampaignMagicLoadingOverlay'
import {
  CampaignPublishSuccess,
  type PublishChannelStatus,
} from '@/components/campaign-magic/CampaignPublishSuccess'
import type { CampaignObjective } from '@/components/campaign-magic/campaign-wizard-types'
import { ConfirmStep } from '@/components/campaign-magic/ConfirmStep'
import { ObjectiveStep } from '@/components/campaign-magic/ObjectiveStep'
import { OfferStep } from '@/components/campaign-magic/OfferStep'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { useCampaignMagicScreen } from '@/hooks/useCampaignMagicScreen'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { platformEntering } from '@/lib/platform-animation'
import type { CampaignPreviewCard } from '@shared/utils/generate-campaign-content'

type ApprovalTab = 'social' | 'emails' | 'landing'
type PreviewCard = CampaignPreviewCard

const STAGGER_MS = 70
const ENTER_DURATION_MS = 420

const APPROVAL_TABS: { id: ApprovalTab; labelKey: TranslationKey; icon: typeof Instagram }[] = [
  { id: 'social', labelKey: 'campaigns.socialPosts', icon: Megaphone },
  { id: 'emails', labelKey: 'campaigns.emails', icon: Mail },
  { id: 'landing', labelKey: 'campaigns.landingCopy', icon: Globe },
]

const PUBLISH_CHANNELS: PublishChannelStatus[] = [
  { id: 'instagram', name: 'Instagram', published: true },
  { id: 'facebook', name: 'Facebook', published: true },
  { id: 'google', name: 'Google', published: true },
  { id: 'whatsapp', name: 'WhatsApp', published: true },
]

function resolveCardMeta(
  card: PreviewCard,
  tab: ApprovalTab,
  previewFallback: string,
): string {
  if (tab === 'social' && card.channel) return card.channel
  if (tab === 'emails' && card.subject) return card.subject
  if (tab === 'landing' && card.label) return card.label
  return previewFallback
}

function resolveCardTitle(
  card: PreviewCard,
  tab: ApprovalTab,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (tab === 'social' && card.channel) {
    return t('campaigns.postChannelPreview', {
      channel: card.channel,
      preview: card.preview,
    })
  }
  return card.preview
}

export default function CampaignMagicScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const {
    brandIdentity,
    phase,
    wizardStep,
    setWizardStep,
    wizardData,
    setWizardData,
    prompt,
    activeTab,
    setActiveTab,
    isSuccessVisible,
    isPublishing,
    activeCampaigns,
    isLoadingCampaigns,
    campaignsError,
    suggestedAudience,
    approvalSummary,
    previewCards,
    loadActiveCampaigns,
    handleStartCreate,
    handleBackToHub,
    handleBackToWizardStart,
    handleLoadingComplete,
    handleGenerate,
    handleEdit,
    handlePublish,
    handleCloseSuccess,
    handleViewOnHome,
  } = useCampaignMagicScreen()

  const contentPadding = isWebDesktop ? 'px-8' : 'px-5'

  return (
    <ThemedScreen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {phase === 'hub' ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName={['flex-grow gap-6 pb-10 pt-4', contentPadding].join(' ')}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingCampaigns}
                onRefresh={() => void loadActiveCampaigns()}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <DesktopContent maxWidth="4xl">
              <ActiveCampaignsHub
                campaigns={activeCampaigns}
                isLoading={isLoadingCampaigns}
                error={campaignsError}
                onCreateCampaign={handleStartCreate}
                onRefresh={() => void loadActiveCampaigns()}
              />
            </DesktopContent>
          </ScrollView>
        ) : null}

        {phase === 'wizard' ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName={['flex-grow gap-6 pb-10 pt-4', contentPadding].join(' ')}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <DesktopContent maxWidth="4xl">
              <Animated.View
                entering={platformEntering(FadeInDown.duration(ENTER_DURATION_MS))}
                className="gap-2"
              >
                <Pressable onPress={handleBackToHub} className="self-start active:opacity-70">
                  <Text className={['text-sm font-medium', tc.backText].join(' ')}>
                    {t('campaigns.backToHub')}
                  </Text>
                </Pressable>
                {wizardStep > 0 ? (
                  <Pressable
                    onPress={handleBackToWizardStart}
                    className="self-start active:opacity-70"
                  >
                    <Text className={['text-xs font-semibold', tc.backText].join(' ')}>
                      {t('campaigns.backToFormStart')}
                    </Text>
                  </Pressable>
                ) : null}
                <View className="flex-row items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
                  <Sparkles size={12} color="#C5A059" />
                  <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
                    {t('campaigns.magicBadge')}
                  </Text>
                </View>
                <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>
                  {t('campaigns.wizardTitle')}
                </Text>
                <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
                  {t('campaigns.wizardSubtitle')}
                </Text>
              </Animated.View>

              {wizardStep === 0 ? (
                <ObjectiveStep
                  selected={wizardData.objective}
                  onSelect={(objective: CampaignObjective) =>
                    setWizardData((current) => ({ ...current, objective }))
                  }
                  onNext={() => setWizardStep(1)}
                />
              ) : null}
              {wizardStep === 1 ? (
                <AudienceStep
                  audience={wizardData.audience}
                  suggestedAudience={suggestedAudience}
                  onChangeAudience={(audience) =>
                    setWizardData((current) => ({ ...current, audience }))
                  }
                  onBack={() => setWizardStep(0)}
                  onNext={() => setWizardStep(2)}
                />
              ) : null}
              {wizardStep === 2 ? (
                <OfferStep
                  offer={wizardData.offer}
                  onChangeOffer={(offer) => setWizardData((current) => ({ ...current, offer }))}
                  onBack={() => setWizardStep(1)}
                  onNext={() => setWizardStep(3)}
                />
              ) : null}
              {wizardStep === 3 ? (
                <ConfirmStep
                  data={wizardData}
                  onBack={() => setWizardStep(2)}
                  onGenerate={handleGenerate}
                />
              ) : null}
            </DesktopContent>
          </ScrollView>
        ) : null}

        {phase === 'loading' ? (
          <CampaignMagicLoadingOverlay onComplete={handleLoadingComplete} />
        ) : null}

        {phase === 'dashboard' ? (
          <View className="flex-1">
            <View className={['border-b pb-4 pt-4', tc.divider, contentPadding].join(' ')}>
              <DesktopContent maxWidth="4xl" className="gap-4">
                <Animated.View
                  entering={platformEntering(FadeInDown.duration(ENTER_DURATION_MS))}
                  className="gap-1"
                >
                  <Pressable
                    onPress={handleBackToHub}
                    className="mb-2 self-start active:opacity-70"
                  >
                    <Text className={['text-sm font-medium', tc.backText].join(' ')}>
                      {t('campaigns.backToHub')}
                    </Text>
                  </Pressable>
                  <Text className={['text-2xl font-bold', tc.textPrimary].join(' ')}>
                    {t('campaigns.approvalDashboardTitle')}
                  </Text>
                  <Text className={['text-sm', tc.textMuted].join(' ')}>
                    {t('campaigns.approvalDashboardSubtitle')}
                  </Text>
                  {brandIdentity ? (
                    <Text className="text-xs text-electricBlue/80">
                      {t('campaigns.basedOnBrand', { name: brandIdentity.companyName })}
                      {prompt.trim()
                        ? ` · ${prompt.trim().slice(0, 60)}${prompt.length > 60 ? '...' : ''}`
                        : ''}
                    </Text>
                  ) : null}
                </Animated.View>
                <View className={isWebDesktop ? 'flex-row flex-wrap gap-2' : 'flex-row gap-2'}>
                  {APPROVAL_TABS.map((tab, index) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <Animated.View
                        key={tab.id}
                        entering={platformEntering(
                          SlideInRight.delay(STAGGER_MS * (index + 1)).duration(ENTER_DURATION_MS),
                        )}
                      >
                        <Pressable
                          onPress={() => setActiveTab(tab.id)}
                          className={[
                            'flex-row items-center gap-2 rounded-2xl px-4 py-2.5',
                            isActive ? 'bg-gold' : tc.tabInactive,
                          ].join(' ')}
                        >
                          <Icon size={14} color={isActive ? '#0A1128' : '#94A3B8'} />
                          <Text
                            className={[
                              'text-xs font-semibold',
                              isActive ? 'text-deepBlue' : tc.tabInactiveText,
                            ].join(' ')}
                          >
                            {t(tab.labelKey)}
                          </Text>
                        </Pressable>
                      </Animated.View>
                    )
                  })}
                </View>
              </DesktopContent>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerClassName={['gap-3 pb-6 pt-4', contentPadding].join(' ')}
              showsVerticalScrollIndicator={false}
            >
              <DesktopContent maxWidth="4xl">
                <View className={isWebDesktop ? 'flex-row flex-wrap gap-3' : 'gap-3'}>
                  {previewCards.map((card, index) => (
                    <Animated.View
                      key={card.id}
                      entering={platformEntering(
                        SlideInUp.delay(STAGGER_MS * (index + 1)).duration(ENTER_DURATION_MS),
                      )}
                      className={[
                        'p-5',
                        tc.glassCard,
                        isWebDesktop ? 'min-w-[calc(50%-6px)] flex-1' : 'w-full',
                      ].join(' ')}
                    >
                      <View className="mb-3 flex-row items-center gap-2">
                        {activeTab === 'social' ? <Instagram size={14} color="#DB2777" /> : null}
                        {activeTab === 'emails' ? <Mail size={14} color="#3B82F6" /> : null}
                        {activeTab === 'landing' ? <Globe size={14} color="#10B981" /> : null}
                        <Text
                          className={[
                            'text-xs font-bold uppercase tracking-wider',
                            tc.textMuted,
                          ].join(' ')}
                        >
                          {resolveCardMeta(card, activeTab, t('campaigns.preview'))}
                        </Text>
                      </View>
                      <Text
                        className={['text-base font-semibold leading-6', tc.textPrimary].join(' ')}
                      >
                        {resolveCardTitle(card, activeTab, t)}
                      </Text>
                      <Text className={['mt-2 text-sm leading-5', tc.textMuted].join(' ')}>
                        {card.detail}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </DesktopContent>
            </ScrollView>

            <Animated.View
              entering={platformEntering(
                FadeInDown.delay(STAGGER_MS * 2).duration(ENTER_DURATION_MS),
              )}
              className={['gap-3 border-t pt-4', tc.footerBar, tc.divider, contentPadding].join(
                ' ',
              )}
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <DesktopContent maxWidth="4xl" className="gap-3">
                <ApprovalSummaryBar
                  channels={approvalSummary.channels}
                  pieceCount={approvalSummary.pieceCount}
                  hoursSaved={approvalSummary.hoursSaved}
                  estimatedLeads={approvalSummary.estimatedLeads}
                />
                <View className="flex-row gap-3">
                  <AnimatedPressable
                    onPress={handleEdit}
                    haptic={false}
                    className={['flex-1 py-4', tc.outlineButton].join(' ')}
                  >
                    <Text
                      className={['text-center text-sm font-bold', tc.outlineButtonText].join(' ')}
                    >
                      {t('common.edit')}
                    </Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    onPress={() => void handlePublish()}
                    disabled={isPublishing}
                    className="flex-[2] rounded-2xl bg-gold py-4"
                    style={{
                      shadowColor: '#C5A059',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 6,
                      opacity: isPublishing ? 0.7 : 1,
                    }}
                  >
                    {isPublishing ? (
                      <ActivityIndicator color="#0A1128" />
                    ) : (
                      <Text className="text-center text-base font-bold text-deepBlue">
                        {t('campaigns.approveAllPublish')}
                      </Text>
                    )}
                  </AnimatedPressable>
                </View>
              </DesktopContent>
            </Animated.View>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <CampaignPublishSuccess
        visible={isSuccessVisible}
        channels={PUBLISH_CHANNELS}
        estimatedLeads={approvalSummary.estimatedLeads}
        hoursSaved={approvalSummary.hoursSaved}
        expectedRoi={approvalSummary.expectedRoi}
        onClose={handleCloseSuccess}
        onGoHome={handleViewOnHome}
      />
    </ThemedScreen>
  )
}
