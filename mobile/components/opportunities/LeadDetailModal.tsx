import { useState, type ReactNode } from 'react'
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ArrowRight,
  Building2,
  Calendar,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Tag,
  X,
} from 'lucide-react-native'
import { categoryLabels, priorityLabels } from '@shared/data'
import type { GrowthFlowLead } from '@/lib/crm-lead-insights'
import { isForgottenLead, isHotLead, resolveHealthColor } from '@/lib/crm-lead-insights'

type DetailTab = 'perfil' | 'historico' | 'acoes'

const TAB_OPTIONS: Array<{ id: DetailTab; label: string }> = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'historico', label: 'Histórico' },
  { id: 'acoes', label: 'Ações Rápidas' },
]

type LeadDetailModalProps = {
  lead: GrowthFlowLead | null
  visible: boolean
  onClose: () => void
  onExecute?: (lead: GrowthFlowLead) => void
}

function resolveLeadTags(lead: GrowthFlowLead): string[] {
  const tags: string[] = [categoryLabels[lead.category], priorityLabels[lead.priority]]

  if (lead.columnId === 'col-fechado') {
    tags.push('Ganho')
  } else if (isHotLead(lead, lead.healthScore)) {
    tags.push('Quente')
  } else if (isForgottenLead(lead, lead.healthScore)) {
    tags.push('Esquecido (IA)')
  }

  if (lead.client?.status === 'inativo') {
    tags.push('Inativo')
  }

  return tags
}

function buildActivityTimeline(lead: GrowthFlowLead) {
  const client = lead.client

  return [
    {
      id: '1',
      type: 'nota',
      title: 'Nota da IA',
      body: lead.nextBestAction,
      date: 'Hoje',
    },
    {
      id: '2',
      type: 'atividade',
      title: lead.title,
      body: lead.description,
      date: lead.dueDate,
    },
    {
      id: '3',
      type: 'contato',
      title: 'Último contato',
      body: client
        ? `Interação registrada com ${client.name}`
        : `Contato com ${lead.clientName}`,
      date: client?.lastContact ?? '—',
    },
  ]
}

function resolvePhoneNumber(lead: GrowthFlowLead): string {
  const seed = lead.id.replace(/\D/g, '').slice(-8).padStart(8, '0')
  return `55119${seed}`
}

export function LeadDetailModal({ lead, visible, onClose, onExecute }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('perfil')

  if (!lead) {
    return null
  }

  const currentLead = lead
  const healthColor = resolveHealthColor(currentLead.healthScore)
  const tags = resolveLeadTags(currentLead)
  const activities = buildActivityTimeline(currentLead)
  const client = currentLead.client
  const phone = resolvePhoneNumber(currentLead)

  async function openUrl(url: string, fallbackMessage: string) {
    const canOpen = await Linking.canOpenURL(url)

    if (!canOpen) {
      Alert.alert('Indisponível', fallbackMessage)
      return
    }

    await Linking.openURL(url)
  }

  function handleCall() {
    void openUrl(`tel:+${phone}`, 'Não foi possível iniciar a chamada neste dispositivo.')
  }

  function handleWhatsApp() {
    const message = encodeURIComponent(
      `Olá ${currentLead.clientName}, tudo bem? Gostaria de dar continuidade em "${currentLead.title}".`,
    )
    void openUrl(
      `https://wa.me/${phone}?text=${message}`,
      'WhatsApp não está disponível neste dispositivo.',
    )
  }

  function handleEmail() {
    const email = client?.email ?? ''
    if (!email) {
      Alert.alert('Sem e-mail', 'Este lead não possui e-mail cadastrado.')
      return
    }

    const subject = encodeURIComponent(`Follow-up: ${currentLead.title}`)
    void openUrl(`mailto:${email}?subject=${subject}`, 'Não foi possível abrir o cliente de e-mail.')
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-deepBlue" edges={['top', 'bottom']}>
        <View className="flex-1 px-5">
          <View className="flex-row items-start justify-between py-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center gap-2">
                <Sparkles size={14} color="#F59E0B" />
                <Text className="text-xs font-bold uppercase tracking-wider text-gold">
                  Detalhe do Lead
                </Text>
              </View>
              <Text className="mt-2 text-2xl font-bold text-white">{currentLead.clientName}</Text>
              <Text className="mt-1 text-sm text-slate-400">{currentLead.title}</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="rounded-full bg-white/10 p-2 active:opacity-70"
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <View>
              <Text className="text-xs text-slate-400">Health Score</Text>
              <Text className="text-lg font-bold" style={{ color: healthColor }}>
                {currentLead.healthScore}%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-slate-400">Impacto potencial</Text>
              <Text className="text-lg font-bold text-emerald">
                +R$ {currentLead.dealImpact.toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>

          <View className="mb-4 flex-row rounded-2xl bg-white/5 p-1">
            {TAB_OPTIONS.map((tab) => {
              const isActive = activeTab === tab.id

              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={[
                    'flex-1 items-center rounded-xl py-2.5',
                    isActive ? 'bg-electricBlue' : '',
                  ].join(' ')}
                >
                  <Text
                    className={[
                      'text-sm font-semibold',
                      isActive ? 'text-white' : 'text-slate-400',
                    ].join(' ')}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {activeTab === 'perfil' ? (
              <View className="gap-4 pb-6">
                <View className="rounded-2xl bg-white/5 p-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Campos customizados
                  </Text>
                  <View className="mt-3 gap-3">
                    <ProfileField
                      icon={<Building2 size={14} color="#94A3B8" />}
                      label="Empresa"
                      value={client?.company ?? '—'}
                    />
                    <ProfileField
                      icon={<Mail size={14} color="#94A3B8" />}
                      label="E-mail"
                      value={client?.email ?? '—'}
                    />
                    <ProfileField
                      icon={<Calendar size={14} color="#94A3B8" />}
                      label="Etapa"
                      value={currentLead.columnTitle ?? '—'}
                    />
                    <ProfileField
                      icon={<Tag size={14} color="#94A3B8" />}
                      label="Prioridade"
                      value={priorityLabels[currentLead.priority]}
                    />
                    <ProfileField
                      icon={<Calendar size={14} color="#94A3B8" />}
                      label="Último contato"
                      value={client?.lastContact ?? '—'}
                    />
                  </View>
                </View>

                <View className="rounded-2xl bg-white/5 p-4">
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tags
                  </Text>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {tags.map((tag) => (
                      <View key={tag} className="rounded-full bg-electricBlue/20 px-3 py-1.5">
                        <Text className="text-xs font-semibold text-electricBlue">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

            {activeTab === 'historico' ? (
              <View className="gap-3 pb-6">
                {activities.map((item) => (
                  <View key={item.id} className="rounded-2xl bg-white/5 p-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
                        {item.type === 'nota' ? 'Nota' : 'Atividade'}
                      </Text>
                      <Text className="text-xs text-slate-500">{item.date}</Text>
                    </View>
                    <Text className="mt-2 text-base font-semibold text-white">{item.title}</Text>
                    <Text className="mt-1 text-sm leading-5 text-slate-400">{item.body}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {activeTab === 'acoes' ? (
              <View className="gap-3 pb-6">
                <QuickActionButton
                  icon={<Phone size={20} color="#FFFFFF" />}
                  label="Ligar"
                  description={`+${phone.slice(0, 2)} ${phone.slice(2)}`}
                  onPress={handleCall}
                />
                <QuickActionButton
                  icon={<MessageCircle size={20} color="#FFFFFF" />}
                  label="WhatsApp"
                  description="Enviar mensagem personalizada"
                  onPress={handleWhatsApp}
                />
                <QuickActionButton
                  icon={<Mail size={20} color="#FFFFFF" />}
                  label="E-mail"
                  description={client?.email ?? 'Sem e-mail cadastrado'}
                  onPress={handleEmail}
                  disabled={!client?.email}
                />

                <Pressable
                  onPress={() => {
                    onExecute?.(currentLead)
                    Alert.alert(
                      'Ação em execução',
                      `A IA vai ${currentLead.nextBestAction.toLowerCase()} para ${currentLead.clientName}.`,
                    )
                  }}
                  className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-electricBlue py-4 active:opacity-90"
                >
                  <Text className="text-sm font-bold text-white">Executar melhor ação (IA)</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <View className="flex-1">
        <Text className="text-xs text-slate-500">{label}</Text>
        <Text className="text-sm font-medium text-white">{value}</Text>
      </View>
    </View>
  )
}

function QuickActionButton({
  icon,
  label,
  description,
  onPress,
  disabled = false,
}: {
  icon: ReactNode
  label: string
  description: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'flex-row items-center gap-4 rounded-2xl bg-white/5 p-4',
        disabled ? 'opacity-40' : 'active:bg-white/10',
      ].join(' ')}
    >
      <View className="rounded-xl bg-electricBlue p-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{label}</Text>
        <Text className="mt-0.5 text-sm text-slate-400">{description}</Text>
      </View>
      <ArrowRight size={16} color="#64748B" />
    </Pressable>
  )
}
