import { Pressable, Text, View } from 'react-native'
import { Linkedin, Megaphone, Sparkles } from 'lucide-react-native'
import { LINKEDIN_AUTHORITY_OPPORTUNITY } from '@/constants/ai-content-engine'
import { premiumColors, premiumShadows } from '@/constants/premium-theme'

type AuthorityOpportunityCardProps = {
  onGenerateArticle: () => void
  onDismiss: () => void
}

export function AuthorityOpportunityCard({
  onGenerateArticle,
  onDismiss,
}: AuthorityOpportunityCardProps) {
  const { prompt } = LINKEDIN_AUTHORITY_OPPORTUNITY

  return (
    <View
      className="overflow-hidden rounded-card border border-summus-700 bg-summus-900 p-6"
      style={premiumShadows.navy}
    >
      <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/5" />
      <View className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-[#0A66C2]/10" />

      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-card bg-[#0A66C2]/15">
          <Linkedin size={18} color="#0A66C2" strokeWidth={1.5} />
        </View>
        <View className="flex-1 flex-row items-center gap-2">
          <Megaphone size={14} color={premiumColors.gold} strokeWidth={1.5} />
          <Text className="text-xs font-bold uppercase tracking-wider text-gold">
            AI Newsroom & Autoridade
          </Text>
        </View>
        <Sparkles size={16} color={premiumColors.gold} strokeWidth={1.5} />
      </View>

      <Text className="mt-4 text-lg font-bold text-white">Oportunidade de Autoridade</Text>

      <Text className="mt-3 text-sm leading-6 text-white/70">{prompt}</Text>

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={onDismiss}
          className="flex-1 rounded-card border border-white/10 py-3.5 active:opacity-70"
        >
          <Text className="text-center text-sm font-semibold text-white/55">Ignorar</Text>
        </Pressable>

        <Pressable
          onPress={onGenerateArticle}
          className="flex-1 rounded-card bg-gold py-3.5 active:opacity-90"
          style={premiumShadows.gold}
        >
          <Text className="text-center text-sm font-bold text-navy">Gerar Artigo</Text>
        </Pressable>
      </View>
    </View>
  )
}
