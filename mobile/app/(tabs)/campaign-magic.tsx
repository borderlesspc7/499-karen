import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  CheckCircle2,
  Globe,
  Instagram,
  Mail,
  Megaphone,
  Sparkles,
  Wand2,
} from 'lucide-react-native'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type ScreenPhase = 'input' | 'loading' | 'dashboard'
type ApprovalTab = 'social' | 'emails' | 'landing'

const LOADING_MESSAGES = [
  'Analisando seu tom de voz...',
  'Criando posts para Instagram...',
  'Escrevendo sequências de e-mail...',
  'Pronto!',
] as const

const LOADING_INTERVAL_MS = 750
const LOADING_TOTAL_MS = 3000

const APPROVAL_TABS: { id: ApprovalTab; label: string; icon: typeof Instagram }[] = [
  { id: 'social', label: 'Posts de Social Media', icon: Megaphone },
  { id: 'emails', label: 'E-mails', icon: Mail },
  { id: 'landing', label: 'Landing Page Copy', icon: Globe },
]

const MOCK_SOCIAL_POSTS = [
  {
    id: 'ig-1',
    channel: 'Instagram',
    preview: 'Descubra o segredo para uma harmonização facial natural e rejuvenescida.',
    detail: 'Carrossel de 4 slides com antes/depois, CTA para agendamento e hashtags locais.',
  },
  {
    id: 'fb-1',
    channel: 'Facebook',
    preview: 'Transforme sua autoestima com protocolos personalizados de harmonização.',
    detail: 'Post com vídeo curto, depoimento de paciente e link direto para WhatsApp.',
  },
  {
    id: 'li-1',
    channel: 'LinkedIn',
    preview: 'A ciência por trás da harmonização facial: o que todo profissional precisa saber.',
    detail: 'Artigo de autoridade com dados de mercado e convite para consulta estratégica.',
  },
]

const MOCK_EMAILS = [
  {
    id: 'email-1',
    subject: 'Bem-vinda à nova era da sua beleza',
    preview: 'Olá! Preparamos uma jornada exclusiva para você conhecer nosso novo serviço...',
    detail: 'E-mail de boas-vindas com vídeo de apresentação e oferta de avaliação gratuita.',
  },
  {
    id: 'email-2',
    subject: 'Últimas vagas para avaliação gratuita',
    preview: 'Restam poucas vagas esta semana para uma consulta personalizada...',
    detail: 'Sequência de urgência com prova social e botão de agendamento.',
  },
  {
    id: 'email-3',
    subject: 'O que nossas pacientes estão dizendo',
    preview: 'Veja os resultados reais de quem já passou pela harmonização conosco...',
    detail: 'E-mail de prova social com depoimentos e FAQ sobre o procedimento.',
  },
]

const MOCK_LANDING_COPY = [
  {
    id: 'lp-1',
    label: 'Headline',
    preview: 'Harmonização Facial Premium — Resultados Naturais em 30 Dias',
    detail: 'Título principal otimizado para conversão e SEO local.',
  },
  {
    id: 'lp-2',
    label: 'Subheadline',
    preview: 'Protocolo exclusivo desenvolvido por especialistas para realçar sua beleza.',
    detail: 'Complemento da headline com proposta de valor clara.',
  },
  {
    id: 'lp-3',
    label: 'CTA Principal',
    preview: 'Agende sua Avaliação Gratuita Agora',
    detail: 'Botão de ação com microcopy de urgência e garantia de satisfação.',
  },
]

type PreviewCard = {
  id: string
  preview: string
  detail: string
  channel?: string
  subject?: string
  label?: string
}

const TAB_CONTENT: Record<ApprovalTab, PreviewCard[]> = {
  social: MOCK_SOCIAL_POSTS,
  emails: MOCK_EMAILS,
  landing: MOCK_LANDING_COPY,
}

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
  const insets = useSafeAreaInsets()
  const [phase, setPhase] = useState<ScreenPhase>('input')
  const [prompt, setPrompt] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<ApprovalTab>('social')
  const [isSuccessVisible, setIsSuccessVisible] = useState(false)

  useEffect(() => {
    if (phase !== 'loading') {
      return
    }

    setLoadingMessageIndex(0)

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((current) => {
        if (current >= LOADING_MESSAGES.length - 1) {
          return current
        }
        return current + 1
      })
    }, LOADING_INTERVAL_MS)

    const completeTimer = setTimeout(() => {
      setPhase('dashboard')
    }, LOADING_TOTAL_MS)

    return () => {
      clearInterval(messageInterval)
      clearTimeout(completeTimer)
    }
  }, [phase])

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      Alert.alert('Campanha Mágica', 'Descreva o que você deseja criar antes de gerar.')
      return
    }

    setPhase('loading')
  }, [prompt])

  const handleEdit = useCallback(() => {
    Alert.alert(
      'Editar Campanha',
      'Em breve você poderá ajustar cada peça da campanha individualmente.',
    )
  }, [])

  const handlePublish = useCallback(() => {
    setIsSuccessVisible(true)
  }, [])

  const handleCloseSuccess = useCallback(() => {
    setIsSuccessVisible(false)
    setPhase('input')
    setPrompt('')
    setActiveTab('social')
  }, [])

  const previewCards = TAB_CONTENT[activeTab]

  return (
    <SafeAreaView className="flex-1 bg-deepBlue" edges={['top']}>
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
            <View className="gap-2">
              <View className="flex-row items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
                <Sparkles size={12} color="#F59E0B" />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  Campaign Magic
                </Text>
              </View>
              <Text className="text-3xl font-bold text-white">Criador de Campanhas</Text>
              <Text className="text-sm leading-5 text-white/60">
                Descreva sua ideia e a IA gera posts, e-mails e copy de landing page em segundos.
              </Text>
            </View>

            <View className="gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
              <View className="flex-row items-center gap-2">
                <Wand2 size={18} color="#3B82F6" />
                <Text className="text-sm font-semibold text-white/80">Input Mágico</Text>
              </View>

              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Ex: Crie uma campanha para meu novo serviço de harmonização facial..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="min-h-[160px] rounded-2xl border border-white/10 bg-deepBlue/60 px-4 py-4 text-base leading-6 text-white"
              />

              <Pressable
                onPress={handleGenerate}
                className="rounded-2xl bg-electricBlue py-4 active:opacity-90"
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
              </Pressable>
            </View>
          </ScrollView>
        ) : null}

        {phase === 'loading' ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="h-24 w-24 items-center justify-center rounded-full border border-electricBlue/30 bg-electricBlue/10">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
            <Text className="mt-8 max-w-sm text-center text-xl font-semibold leading-8 text-white">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </Text>
            <View className="mt-6 flex-row gap-2">
              {LOADING_MESSAGES.map((_, index) => (
                <View
                  key={LOADING_MESSAGES[index]}
                  className={[
                    'h-1.5 rounded-full',
                    index <= loadingMessageIndex ? 'w-8 bg-electricBlue' : 'w-4 bg-white/20',
                  ].join(' ')}
                />
              ))}
            </View>
          </View>
        ) : null}

        {phase === 'dashboard' ? (
          <View className="flex-1">
            <View
              className={[
                'gap-4 border-b border-white/10 pb-4 pt-4',
                isWebDesktop ? 'mx-auto w-full max-w-2xl px-8' : 'px-5',
              ].join(' ')}
            >
              <View className="gap-1">
                <Text className="text-2xl font-bold text-white">Dashboard de Aprovação</Text>
                <Text className="text-sm text-white/50">
                  Revise e aprove o conteúdo gerado para todos os canais.
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {APPROVAL_TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                      <Pressable
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        className={[
                          'flex-row items-center gap-2 rounded-2xl px-4 py-2.5',
                          isActive ? 'bg-electricBlue' : 'border border-white/10 bg-white/5',
                        ].join(' ')}
                      >
                        <Icon size={14} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                        <Text
                          className={[
                            'text-xs font-semibold',
                            isActive ? 'text-white' : 'text-white/60',
                          ].join(' ')}
                        >
                          {tab.label}
                        </Text>
                      </Pressable>
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
              {previewCards.map((card) => (
                <View
                  key={card.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <View className="mb-3 flex-row items-center gap-2">
                    {activeTab === 'social' ? (
                      <Instagram size={14} color="#DB2777" />
                    ) : null}
                    {activeTab === 'emails' ? <Mail size={14} color="#3B82F6" /> : null}
                    {activeTab === 'landing' ? <Globe size={14} color="#10B981" /> : null}
                    <Text className="text-xs font-bold uppercase tracking-wider text-white/50">
                      {resolveCardMeta(card, activeTab)}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold leading-6 text-white">
                    {resolveCardTitle(card, activeTab)}
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-white/50">{card.detail}</Text>
                </View>
              ))}
            </ScrollView>

            <View
              className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-deepBlue/95 px-5 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <View
                className={[
                  'flex-row gap-3',
                  isWebDesktop ? 'mx-auto w-full max-w-2xl' : '',
                ].join(' ')}
              >
                <Pressable
                  onPress={handleEdit}
                  className="flex-1 rounded-2xl border border-white/25 py-4 active:opacity-80"
                >
                  <Text className="text-center text-sm font-bold text-white">Editar</Text>
                </Pressable>
                <Pressable
                  onPress={handlePublish}
                  className="flex-[2] rounded-2xl bg-gold py-4 active:opacity-90"
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
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <Modal
        visible={isSuccessVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseSuccess}
      >
        <View className="flex-1 items-center justify-center bg-black/70 px-8">
          <View className="w-full max-w-sm rounded-3xl border border-white/10 bg-deepBlue p-8">
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald/15">
                <CheckCircle2 size={44} color="#10B981" strokeWidth={2} />
              </View>
              <Text className="mt-6 text-center text-xl font-bold text-white">Campanha no Ar!</Text>
              <Text className="mt-3 text-center text-sm leading-6 text-white/60">
                A IA está publicando em todos os seus canais conectados.
              </Text>
              <Pressable
                onPress={handleCloseSuccess}
                className="mt-8 w-full rounded-2xl bg-electricBlue py-3.5 active:opacity-90"
              >
                <Text className="text-center text-sm font-bold text-white">Perfeito!</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
