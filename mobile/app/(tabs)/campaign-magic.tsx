import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeInDown, SlideInRight, SlideInUp } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import {
  CheckCircle2,
  Globe,
  Instagram,
  Mail,
  Megaphone,
  Sparkles,
  Wand2,
} from 'lucide-react-native'
import { CampaignMagicLoadingOverlay } from '@/components/campaign-magic/CampaignMagicLoadingOverlay'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusModal, SummusModalCard, SummusSuccessContent } from '@/components/ui/modal'
import { CAMPAIGN_LAUNCHED_PARAM } from '@/constants/campaign-journey'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useGamification } from '@shared/contexts'
import {
  generateCampaignContent,
  type CampaignPreviewCard,
  type GeneratedCampaignContent,
} from '@shared/utils/generate-campaign-content'

type ScreenPhase = 'input' | 'loading' | 'dashboard'
type ApprovalTab = 'social' | 'emails' | 'landing'

const STAGGER_MS = 70
const ENTER_DURATION_MS = 420
const SUCCESS_REDIRECT_MS = 2000

const APPROVAL_TABS: { id: ApprovalTab; label: string; icon: typeof Instagram }[] = [
  { id: 'social', label: 'Posts de Social Media', icon: Megaphone },
  { id: 'emails', label: 'E-mails', icon: Mail },
  { id: 'landing', label: 'Landing Page Copy', icon: Globe },
]

const FALLBACK_CAMPAIGN = generateCampaignContent({
  userPrompt: '',
  brandIdentity: null,
  brandAiContext: null,
  userProfile: null,
})

type PreviewCard = CampaignPreviewCard

function resolveCardMeta(card: PreviewCard, tab: ApprovalTab): string {
  if (tab === 'social' && card.channel) {
    return card.channel
  }

  if (tab === 'emails' && card.subject) {
    return card.subject
  }

  if (tab === 'landing' && card.label) {
    return card.label
  }

  return 'Preview'
}

function resolveCardTitle(card: PreviewCard, tab: ApprovalTab): string {
  if (tab === 'social' && card.channel) {
    return `Post ${card.channel}: ${card.preview}`
  }

  return card.preview
}

export default function CampaignMagicScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { brandIdentity, brandAiContext, userProfile } = useGamification()
  const insets = useSafeAreaInsets()
  const [phase, setPhase] = useState<ScreenPhase>('input')
  const [prompt, setPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<ApprovalTab>('social')
  const [isSuccessVisible, setIsSuccessVisible] = useState(false)
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaignContent>(
    FALLBACK_CAMPAIGN,
  )

  const handleLoadingComplete = useCallback(() => {
    setPhase('dashboard')
  }, [])

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      Alert.alert('Campanha Mágica', 'Descreva o que você deseja criar antes de gerar.')
      return
    }

    setGeneratedCampaign(
      generateCampaignContent({
        userPrompt: prompt,
        brandIdentity,
        brandAiContext,
        userProfile,
      }),
    )
    setPhase('loading')
  }, [prompt, brandIdentity, brandAiContext, userProfile])

  const handleEdit = useCallback(() => {
    Alert.alert(
      'Editar Campanha',
      'Em breve você poderá ajustar cada peça da campanha individualmente.',
    )
  }, [])

  const handlePublish = useCallback(() => {
    setIsSuccessVisible(true)
  }, [])

  const navigateToHomeAfterLaunch = useCallback(() => {
    setIsSuccessVisible(false)
    router.replace({
      pathname: '/(tabs)/index',
      params: { [CAMPAIGN_LAUNCHED_PARAM]: '1' },
    })
  }, [])

  useEffect(() => {
    if (!isSuccessVisible) {
      return
    }

    const redirectTimer = setTimeout(navigateToHomeAfterLaunch, SUCCESS_REDIRECT_MS)
    return () => clearTimeout(redirectTimer)
  }, [isSuccessVisible, navigateToHomeAfterLaunch])

  const handleCloseSuccess = useCallback(() => {
    navigateToHomeAfterLaunch()
  }, [navigateToHomeAfterLaunch])

  const previewCards = generatedCampaign[activeTab]

  return (
    <ThemedScreen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {phase === 'input' ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName={[
              'flex-grow gap-6 pb-10 pt-4',
              isWebDesktop ? 'mx-auto w-full max-w-2xl px-8' : 'px-5',
            ].join(' ')}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInDown.duration(ENTER_DURATION_MS)}
              className="gap-2"
            >
              <View className="flex-row items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
                <Sparkles size={12} color="#F59E0B" />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  Campaign Magic
                </Text>
              </View>
              <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>
                Criador de Campanhas
              </Text>
              <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
                Descreva sua ideia e a IA gera posts, e-mails e copy de landing page em segundos.
              </Text>
              {brandIdentity ? (
                <View className="mt-2 flex-row items-center gap-2 self-start rounded-full border border-electricBlue/30 bg-electricBlue/10 px-3 py-1.5">
                  <Sparkles size={12} color="#3B82F6" />
                  <Text className="text-[11px] font-medium text-electricBlue">
                    Personalizando para {brandIdentity.companyName}
                  </Text>
                </View>
              ) : (
                <Text className="mt-1 text-xs text-amber-400/90">
                  Complete a identidade da marca em Configurações para campanhas personalizadas.
                </Text>
              )}
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(STAGGER_MS).duration(ENTER_DURATION_MS)}
              className={['gap-4 p-5', tc.cardLg].join(' ')}
            >
              <View className="flex-row items-center gap-2">
                <Wand2 size={18} color="#3B82F6" />
                <Text className={['text-sm font-semibold', tc.textLabel].join(' ')}>
                  Input Mágico
                </Text>
              </View>

              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder={
                  brandIdentity
                    ? `Ex: Campanha para divulgar ${brandIdentity.servicesDescription.slice(0, 60)}...`
                    : 'Ex: Crie uma campanha para meu novo serviço de harmonização facial...'
                }
                placeholderTextColor={tc.placeholderColor}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className={['min-h-[160px]', tc.input].join(' ')}
              />

              <AnimatedPressable
                onPress={handleGenerate}
                className="rounded-2xl bg-electricBlue py-4"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-center text-base font-bold text-white">
                  Gerar Campanha Completa
                </Text>
              </AnimatedPressable>
            </Animated.View>
          </ScrollView>
        ) : null}

        {phase === 'loading' ? (
          <View className="flex-1">
            <CampaignMagicLoadingOverlay onComplete={handleLoadingComplete} />
          </View>
        ) : null}

        {phase === 'dashboard' ? (
          <View className="flex-1">
            <View
              className={[
                'gap-4 border-b pb-4 pt-4',
                tc.divider,
                isWebDesktop ? 'mx-auto w-full max-w-2xl px-8' : 'px-5',
              ].join(' ')}
            >
              <Animated.View
                entering={FadeInDown.duration(ENTER_DURATION_MS)}
                className="gap-1"
              >
                <Text className={['text-2xl font-bold', tc.textPrimary].join(' ')}>
                  Dashboard de Aprovação
                </Text>
                <Text className={['text-sm', tc.textMuted].join(' ')}>
                  Revise e aprove o conteúdo gerado para todos os canais.
                </Text>
                {brandIdentity ? (
                  <Text className="text-xs text-electricBlue/80">
                    Baseado na identidade de {brandIdentity.companyName}
                    {prompt.trim() ? ` · tema: "${prompt.trim().slice(0, 50)}${prompt.length > 50 ? '...' : ''}"` : ''}
                  </Text>
                ) : null}
              </Animated.View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {APPROVAL_TABS.map((tab, index) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                      <Animated.View
                        key={tab.id}
                        entering={SlideInRight.delay(STAGGER_MS * (index + 1)).duration(
                          ENTER_DURATION_MS,
                        )}
                      >
                        <Pressable
                          onPress={() => setActiveTab(tab.id)}
                          className={[
                            'flex-row items-center gap-2 rounded-2xl px-4 py-2.5',
                            isActive ? 'bg-electricBlue' : tc.tabInactive,
                          ].join(' ')}
                        >
                          <Icon size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                          <Text
                            className={[
                              'text-xs font-semibold',
                              isActive ? 'text-white' : tc.tabInactiveText,
                            ].join(' ')}
                          >
                            {tab.label}
                          </Text>
                        </Pressable>
                      </Animated.View>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerClassName={[
                'gap-3 pb-36 pt-4',
                isWebDesktop ? 'mx-auto w-full max-w-2xl px-8' : 'px-5',
              ].join(' ')}
              showsVerticalScrollIndicator={false}
            >
              {previewCards.map((card, index) => (
                <Animated.View
                  key={card.id}
                  entering={SlideInUp.delay(STAGGER_MS * (index + 1)).duration(ENTER_DURATION_MS)}
                  className={['p-5', tc.cardLg].join(' ')}
                >
                  <View className="mb-3 flex-row items-center gap-2">
                    {activeTab === 'social' ? (
                      <Instagram size={14} color="#DB2777" />
                    ) : null}
                    {activeTab === 'emails' ? <Mail size={14} color="#3B82F6" /> : null}
                    {activeTab === 'landing' ? <Globe size={14} color="#10B981" /> : null}
                    <Text className={['text-xs font-bold uppercase tracking-wider', tc.textMuted].join(' ')}>
                      {resolveCardMeta(card, activeTab)}
                    </Text>
                  </View>
                  <Text className={['text-base font-semibold leading-6', tc.textPrimary].join(' ')}>
                    {resolveCardTitle(card, activeTab)}
                  </Text>
                  <Text className={['mt-2 text-sm leading-5', tc.textMuted].join(' ')}>
                    {card.detail}
                  </Text>
                </Animated.View>
              ))}
            </ScrollView>

            <Animated.View
              entering={FadeInDown.delay(STAGGER_MS * 2).duration(ENTER_DURATION_MS)}
              className={['absolute bottom-0 left-0 right-0 px-5 pt-4', tc.footerBar].join(' ')}
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <View
                className={[
                  'flex-row gap-3',
                  isWebDesktop ? 'mx-auto w-full max-w-2xl' : '',
                ].join(' ')}
              >
                <AnimatedPressable
                  onPress={handleEdit}
                  haptic={false}
                  className={['flex-1 py-4', tc.outlineButton].join(' ')}
                >
                  <Text className={['text-center text-sm font-bold', tc.outlineButtonText].join(' ')}>
                    Editar
                  </Text>
                </AnimatedPressable>
                <AnimatedPressable
                  onPress={handlePublish}
                  className="flex-[2] rounded-2xl bg-gold py-4"
                  style={{
                    shadowColor: '#F59E0B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-center text-base font-bold text-deepBlue">
                    Aprovar Tudo & Publicar
                  </Text>
                </AnimatedPressable>
              </View>
            </Animated.View>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <SummusModal visible={isSuccessVisible} onClose={handleCloseSuccess} dismissOnBackdrop={false}>
        <SummusModalCard>
          <SummusSuccessContent
            title="Campanha no Ar!"
            message="A IA está publicando em todos os seus canais conectados."
            icon={CheckCircle2}
            action={
              <AnimatedPressable
                onPress={handleCloseSuccess}
                className="rounded-2xl bg-electricBlue py-3.5"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-center text-sm font-bold text-white">Perfeito!</Text>
              </AnimatedPressable>
            }
          />
        </SummusModalCard>
      </SummusModal>
    </ThemedScreen>
  )
}
