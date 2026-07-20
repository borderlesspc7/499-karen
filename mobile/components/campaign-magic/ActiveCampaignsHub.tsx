import { Pressable, Text, View } from 'react-native'
import { Megaphone, Plus, TrendingUp } from 'lucide-react-native'
import type { SavedCampaign } from '@shared/types'
import { CAMPAIGN_OBJECTIVES } from '@/components/campaign-magic/campaign-wizard-types'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { premiumColors } from '@/constants/premium-theme'

type ActiveCampaignsHubProps = {
  campaigns: SavedCampaign[]
  isLoading: boolean
  error: string | null
  onCreateCampaign: () => void
  onRefresh: () => void
  onSelectCampaign?: (campaign: SavedCampaign) => void
}

function formatViews(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(value)
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function resolveObjectiveLabel(objective: SavedCampaign['objective']): string {
  return CAMPAIGN_OBJECTIVES.find((item) => item.id === objective)?.label ?? 'Campanha'
}

function ActiveCampaignListCard({
  campaign,
  onPress,
}: {
  campaign: SavedCampaign
  onPress?: () => void
}) {
  const tc = useThemeClasses()

  return (
    <Pressable
      onPress={onPress}
      className={['gap-4 p-5 active:opacity-90', tc.glassCard].join(' ')}
      style={tc.cardShadow}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Megaphone size={14} color={premiumColors.gold} strokeWidth={1.5} />
            <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
              {resolveObjectiveLabel(campaign.objective)}
            </Text>
          </View>
          <Text className={['text-lg font-bold', tc.textPrimary].join(' ')} numberOfLines={2}>
            {campaign.title}
          </Text>
          <Text className={['text-sm leading-5', tc.textSecondary].join(' ')} numberOfLines={2}>
            {campaign.audience
              ? `Público: ${campaign.audience}`
              : 'Campanha omnichannel em operação'}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1.5">
          <TrendingUp size={12} color={premiumColors.emerald} strokeWidth={2} />
          <Text className="text-[11px] font-bold text-emerald">Ao vivo</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <View className={['flex-1 rounded-2xl px-3 py-3', tc.surfaceMuted].join(' ')}>
          <Text className={['text-[10px] font-semibold uppercase', tc.textMuted].join(' ')}>
            Views
          </Text>
          <Text className={['mt-1 text-base font-bold', tc.textPrimary].join(' ')}>
            {formatViews(campaign.metrics.views)}
          </Text>
        </View>
        <View className={['flex-1 rounded-2xl px-3 py-3', tc.surfaceMuted].join(' ')}>
          <Text className={['text-[10px] font-semibold uppercase', tc.textMuted].join(' ')}>
            Leads
          </Text>
          <Text className={['mt-1 text-base font-bold', tc.textPrimary].join(' ')}>
            {campaign.metrics.leads}
          </Text>
        </View>
        <View className={['flex-1 rounded-2xl px-3 py-3', tc.surfaceMuted].join(' ')}>
          <Text className={['text-[10px] font-semibold uppercase', tc.textMuted].join(' ')}>
            CPL
          </Text>
          <Text className={['mt-1 text-base font-bold', tc.textPrimary].join(' ')}>
            {formatCurrency(campaign.metrics.costPerLead)}
          </Text>
        </View>
      </View>

      {campaign.channels.length > 0 ? (
        <Text className={['text-xs', tc.textMuted].join(' ')}>
          Canais: {campaign.channels.join(' · ')}
        </Text>
      ) : null}
    </Pressable>
  )
}

export function ActiveCampaignsHub({
  campaigns,
  isLoading,
  error,
  onCreateCampaign,
  onRefresh,
  onSelectCampaign,
}: ActiveCampaignsHubProps) {
  const tc = useThemeClasses()

  return (
    <View className="gap-6">
      <View className="gap-2">
        <View className="flex-row items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
          <Megaphone size={12} color={premiumColors.gold} />
          <Text className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Campanhas
          </Text>
        </View>
        <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>
          Campanhas ativas
        </Text>
        <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
          Acompanhe o desempenho das campanhas publicadas e crie uma nova quando quiser.
        </Text>
      </View>

      <Pressable
        onPress={onCreateCampaign}
        className="flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4 active:opacity-90"
      >
        <Plus size={18} color="#0A1128" strokeWidth={2.5} />
        <Text className="text-base font-bold text-deepBlue">Criar nova campanha</Text>
      </Pressable>

      {error ? (
        <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-600">{error}</Text>
          <Pressable onPress={onRefresh} className="mt-3 self-start">
            <Text className="text-sm font-semibold text-red-700">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading && campaigns.length === 0 ? (
        <View className={['rounded-3xl p-8', tc.emptyState].join(' ')}>
          <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>
            Carregando campanhas...
          </Text>
        </View>
      ) : null}

      {!isLoading && campaigns.length === 0 && !error ? (
        <View className={['items-center gap-3 rounded-3xl p-8', tc.emptyState].join(' ')}>
          <Text className={['text-center text-base font-semibold', tc.textPrimary].join(' ')}>
            Nenhuma campanha ativa ainda
          </Text>
          <Text className={['text-center text-sm leading-5', tc.textSecondary].join(' ')}>
            Publique sua primeira campanha pelo Campaign Magic para vê-la aqui com métricas em
            tempo real.
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        {campaigns.map((campaign) => (
          <ActiveCampaignListCard
            key={campaign.id}
            campaign={campaign}
            onPress={onSelectCampaign ? () => onSelectCampaign(campaign) : undefined}
          />
        ))}
      </View>
    </View>
  )
}
