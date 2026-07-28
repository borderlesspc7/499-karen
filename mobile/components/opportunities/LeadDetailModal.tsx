import { useState, type ReactNode } from 'react'
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import {
  ArrowRight,
  Building2,
  Calendar,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Tag,
} from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import {
  getCategoryLabel,
  getKanbanColumnTitle,
  getPriorityLabel,
} from '@shared/data'
import { getLeadSourceLabel } from '@shared/types'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusSheetModal } from '@/components/ui/modal'
import type { GrowthFlowLead } from '@/lib/crm-lead-insights'
import { isForgottenLead, isHotLead, resolveHealthColor } from '@/lib/crm-lead-insights'

type DetailTab = 'perfil' | 'historico' | 'acoes'

type LeadDetailModalProps = {
  lead: GrowthFlowLead | null
  visible: boolean
  onClose: () => void
  onExecute?: (lead: GrowthFlowLead) => void
  onEdit?: (lead: GrowthFlowLead) => void
  onDelete?: (lead: GrowthFlowLead) => void
}

export function LeadDetailModal({
  lead,
  visible,
  onClose,
  onExecute,
  onEdit,
  onDelete,
}: LeadDetailModalProps) {
  const { t, locale } = useTranslation()
  const [activeTab, setActiveTab] = useState<DetailTab>('perfil')

  if (!lead) {
    return null
  }

  const currentLead = lead
  const healthColor = resolveHealthColor(currentLead.healthScore)
  const nextActionLabel = t(currentLead.nextBestAction)
  const dash = t('common.emDash')

  const tags: string[] = [
    getCategoryLabel(t, currentLead.category),
    getPriorityLabel(t, currentLead.priority),
    getLeadSourceLabel(t, currentLead.source),
  ]

  if (currentLead.columnId === 'col-fechado') {
    tags.push(t('opportunities.tagWon'))
  } else if (isHotLead(currentLead, currentLead.healthScore)) {
    tags.push(t('opportunities.tagHot'))
  } else if (isForgottenLead(currentLead, currentLead.healthScore)) {
    tags.push(t('opportunities.tagForgotten'))
  }

  if (currentLead.client?.status === 'inativo') {
    tags.push(t('opportunities.tagInactive'))
  }

  const client = currentLead.client
  const phone = client?.phone?.replace(/\D/g, '') ?? null

  const activities = [
    {
      id: '1',
      type: 'nota' as const,
      title: t('opportunities.nextStepSuggested'),
      body: nextActionLabel,
      date: t('opportunities.today'),
    },
    {
      id: '2',
      type: 'atividade' as const,
      title: currentLead.title,
      body: currentLead.description,
      date: currentLead.dueDate,
    },
    {
      id: '3',
      type: 'contato' as const,
      title: t('opportunities.lastContact'),
      body: t('opportunities.interactionWith', {
        name: client?.name ?? currentLead.clientName,
      }),
      date: client?.lastContact ?? dash,
    },
  ]

  const tabOptions: Array<{ id: DetailTab; label: string }> = [
    { id: 'perfil', label: t('opportunities.tabProfile') },
    { id: 'historico', label: t('opportunities.tabHistory') },
    { id: 'acoes', label: t('opportunities.tabActions') },
  ]

  async function openUrl(url: string, fallbackMessage: string) {
    const canOpen = await Linking.canOpenURL(url)

    if (!canOpen) {
      Alert.alert(t('opportunities.unavailable'), fallbackMessage)
      return
    }

    await Linking.openURL(url)
  }

  function handleCall() {
    if (!phone) {
      Alert.alert(t('opportunities.noPhoneTitle'), t('opportunities.noPhoneBody'))
      return
    }

    void openUrl(`tel:+${phone}`, t('opportunities.callFailed'))
  }

  function handleWhatsApp() {
    if (!phone) {
      Alert.alert(t('opportunities.noPhoneTitle'), t('opportunities.noPhoneBody'))
      return
    }

    const message = encodeURIComponent(
      t('opportunities.whatsappPrefill', {
        name: currentLead.clientName,
        title: currentLead.title,
      }),
    )
    void openUrl(
      `https://wa.me/${phone}?text=${message}`,
      t('opportunities.whatsappUnavailable'),
    )
  }

  function handleEmail() {
    const email = client?.email ?? ''
    if (!email) {
      Alert.alert(t('opportunities.noEmailTitle'), t('opportunities.noEmailBody'))
      return
    }

    const subject = encodeURIComponent(
      t('opportunities.emailSubject', { title: currentLead.title }),
    )
    void openUrl(`mailto:${email}?subject=${subject}`, t('opportunities.emailClientFailed'))
  }

  const dealValueLabel =
    currentLead.dealValue > 0
      ? `R$ ${currentLead.dealValue.toLocaleString(locale)}`
      : t('opportunities.dealEstimated', {
          amount: currentLead.dealImpact.toLocaleString(locale),
        })

  return (
    <SummusSheetModal
      visible={visible}
      onClose={onClose}
      badge={t('opportunities.detailBadge')}
      badgeIcon={Sparkles}
      title={currentLead.clientName}
      subtitle={currentLead.title}
      maxWidthClassName="max-w-xl"
    >
      <View className="flex-1 px-5">
        <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <View>
            <Text className="text-xs font-medium text-white/45">{t('opportunities.healthScore')}</Text>
            <Text className="text-lg font-bold" style={{ color: healthColor }}>
              {currentLead.healthScore}%
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-medium text-white/45">
              {t('opportunities.potentialImpact')}
            </Text>
            <Text className="text-lg font-bold text-emerald">
              +R$ {currentLead.dealImpact.toLocaleString(locale)}
            </Text>
          </View>
        </View>

        <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-white/5 p-1">
          {tabOptions.map((tab) => {
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
                    isActive ? 'text-white' : 'text-white/45',
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
              <View className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-xs font-bold uppercase tracking-wider text-white/40">
                  {t('opportunities.customFields')}
                </Text>
                <View className="mt-3 gap-3">
                  <ProfileField
                    icon={<Building2 size={14} color="#94A3B8" />}
                    label={t('opportunities.company')}
                    value={client?.company ?? dash}
                  />
                  <ProfileField
                    icon={<Mail size={14} color="#94A3B8" />}
                    label={t('opportunities.email')}
                    value={client?.email ?? dash}
                  />
                  <ProfileField
                    icon={<Calendar size={14} color="#94A3B8" />}
                    label={t('opportunities.stage')}
                    value={getKanbanColumnTitle(
                      t,
                      currentLead.columnId,
                      currentLead.columnTitle ?? dash,
                    )}
                  />
                  <ProfileField
                    icon={<Tag size={14} color="#94A3B8" />}
                    label={t('opportunities.priority')}
                    value={getPriorityLabel(t, currentLead.priority)}
                  />
                  <ProfileField
                    icon={<Tag size={14} color="#94A3B8" />}
                    label={t('opportunities.dealValue')}
                    value={dealValueLabel}
                  />
                  <ProfileField
                    icon={<Tag size={14} color="#94A3B8" />}
                    label={t('opportunities.source')}
                    value={getLeadSourceLabel(t, currentLead.source)}
                  />
                  <ProfileField
                    icon={<Calendar size={14} color="#94A3B8" />}
                    label={t('opportunities.lastContact')}
                    value={client?.lastContact ?? dash}
                  />
                </View>
              </View>

              {(onEdit || onDelete) && (
                <View className="flex-row gap-3">
                  {onEdit ? (
                    <Pressable
                      onPress={() => onEdit(currentLead)}
                      className="flex-1 rounded-2xl bg-electricBlue py-3"
                    >
                      <Text className="text-center text-sm font-semibold text-white">
                        {t('common.edit')}
                      </Text>
                    </Pressable>
                  ) : null}
                  {onDelete ? (
                    <Pressable
                      onPress={() => onDelete(currentLead)}
                      className="flex-1 rounded-2xl border border-red-400/40 bg-red-500/10 py-3"
                    >
                      <Text className="text-center text-sm font-semibold text-red-300">
                        {t('common.delete')}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}

              <View className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Text className="text-xs font-bold uppercase tracking-wider text-white/40">
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
                <View key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
                label={t('opportunities.call')}
                description={
                  phone
                    ? `+${phone.slice(0, 2)} ${phone.slice(2)}`
                    : t('opportunities.noPhone')
                }
                onPress={handleCall}
              />
              <QuickActionButton
                icon={<MessageCircle size={20} color="#FFFFFF" />}
                label={t('opportunities.whatsapp')}
                description={t('opportunities.sendPersonalized')}
                onPress={handleWhatsApp}
              />
              <QuickActionButton
                icon={<Mail size={20} color="#FFFFFF" />}
                label={t('opportunities.email')}
                description={client?.email ?? t('opportunities.noEmail')}
                onPress={handleEmail}
                disabled={!client?.email}
              />

              <AnimatedPressable
                onPress={() => {
                  onExecute?.(currentLead)
                  Alert.alert(
                    t('opportunities.nextStep'),
                    `${nextActionLabel} — ${currentLead.clientName}.`,
                  )
                }}
                className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-electricBlue py-4"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-sm font-bold text-white">{t('opportunities.registerNext')}</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </AnimatedPressable>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SummusSheetModal>
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
        <Text className="text-xs text-white/45">{label}</Text>
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
        'flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4',
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
