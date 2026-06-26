import { Pressable, ScrollView, Text, View } from 'react-native'
import { Inbox as InboxIcon } from 'lucide-react-native'
import type { InboxConversation } from '@/constants/inbox-mock-data'
import { InboxChannelIcon } from './InboxChannelIcon'

type InboxConversationListProps = {
  conversations: InboxConversation[]
  selectedId: string | null
  onSelect: (conversationId: string) => void
  isCompact?: boolean
}

export function InboxConversationList({
  conversations,
  selectedId,
  onSelect,
  isCompact = false,
}: InboxConversationListProps) {
  return (
    <View className={['flex-1 bg-white', isCompact ? 'border-r border-slate-200' : ''].join(' ')}>
      <View className="border-b border-slate-100 px-5 pb-4 pt-5">
        <View className="flex-row items-center gap-2">
          <InboxIcon size={16} color="#3B82F6" />
          <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
            Unified Inbox
          </Text>
        </View>
        <Text className="mt-2 text-2xl font-bold text-deepBlue">Omnichannel</Text>
        <Text className="mt-1 text-sm text-slate-500">
          WhatsApp, Instagram, E-mail e SMS num só lugar.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {conversations.map((conversation) => {
          const isSelected = selectedId === conversation.id

          return (
            <Pressable
              key={conversation.id}
              onPress={() => onSelect(conversation.id)}
              className={[
                'flex-row items-center gap-3 border-b border-slate-50 px-5 py-4',
                isSelected ? 'bg-electricBlue/5' : 'bg-white active:bg-slate-50',
              ].join(' ')}
            >
              <InboxChannelIcon channel={conversation.channel} size="sm" />

              <View className="min-w-0 flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-base font-semibold text-deepBlue" numberOfLines={1}>
                    {conversation.contactName}
                  </Text>
                  <Text className="text-xs text-slate-400">{conversation.updatedAt}</Text>
                </View>
                <Text className="mt-0.5 text-xs text-slate-400" numberOfLines={1}>
                  {conversation.company}
                </Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
                  {conversation.preview}
                </Text>
              </View>

              {conversation.unreadCount > 0 ? (
                <View className="min-w-[22px] items-center rounded-full bg-electricBlue px-1.5 py-0.5">
                  <Text className="text-xs font-bold text-white">{conversation.unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
