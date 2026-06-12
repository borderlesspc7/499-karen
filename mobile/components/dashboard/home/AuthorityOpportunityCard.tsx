import { Pressable, Text, View } from 'react-native'
import { Linkedin, Megaphone, Sparkles } from 'lucide-react-native'
import { LINKEDIN_AUTHORITY_OPPORTUNITY } from '@/constants/ai-content-engine'

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
      className="overflow-hidden rounded-3xl border border-white/10 bg-[#131F35] p-6"
      style={{
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#0A66C2]/10" />

      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#0A66C2]/20">
          <Linkedin size={18} color="#0A66C2" />
        </View>
        <View className="flex-1 flex-row items-center gap-2">
          <Megaphone size={14} color="#F59E0B" />
          <Text className="text-xs font-bold uppercase tracking-wider text-gold">
            AI Newsroom & Autoridade
          </Text>
        </View>
        <Sparkles size={16} color="#F59E0B" />
      </View>

      <Text className="mt-4 text-lg font-bold text-white">Oportunidade de Autoridade</Text>

      <Text className="mt-3 text-sm leading-6 text-white/75">{prompt}</Text>

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={onDismiss}
          className="flex-1 rounded-2xl border border-white/15 py-3.5 active:opacity-70"
        >
          <Text className="text-center text-sm font-semibold text-white/60">Ignorar</Text>
        </Pressable>

        <Pressable
          onPress={onGenerateArticle}
          className="flex-1 rounded-2xl bg-electricBlue py-3.5 active:opacity-90"
        >
          <Text className="text-center text-sm font-bold text-white">Gerar Artigo</Text>
        </Pressable>
      </View>
    </View>
  )
}
