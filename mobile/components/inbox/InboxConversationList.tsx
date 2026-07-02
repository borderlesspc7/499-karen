import { Pressable, ScrollView, Text, View } from 'react-native'
import { Inbox as InboxIcon } from 'lucide-react-native'
import type { InboxConversation } from '@/constants/inbox-mock-data'
import { useThemeClasses } from '@/hooks/useThemeClasses'
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
  const tc = useThemeClasses()

  return (
    <View
      className={[
        'flex-1',
        tc.panel,
        isCompact ? `border-r ${tc.isDark ? 'border-white/10' : 'border-slate-200'}` : '',
      ].join(' ')}
    >
      <View className={['border-b px-5 pb-4 pt-5', tc.isDark ? 'border-white/10' : 'border-slate-100'].join(' ')}>
        <View className="flex-row items-center gap-2">
          <InboxIcon size={16} color="#3B82F6" />
          <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
            Unified Inbox
          </Text>
        </View>
        <Text className={['mt-2 text-2xl font-bold', tc.textPrimary].join(' ')}>Omnichannel</Text>
        <Text className={['mt-1 text-sm', tc.textSecondary].join(' ')}>
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
                'flex-row items-center gap-3 border-b px-5 py-4',
                tc.isDark ? 'border-white/5' : 'border-slate-50',
                isSelected ? tc.listItemActive : tc.listItem,
                tc.listItemPressed,
              ].join(' ')}
            >
              <InboxChannelIcon channel={conversation.channel} size="sm" />

              <View className="min-w-0 flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text
                    className={['flex-1 text-base font-semibold', tc.textPrimary].join(' ')}
                    numberOfLines={1}
                  >
                    {conversation.contactName}
                  </Text>
                  <Text className={['text-xs', tc.textMuted].join(' ')}>{conversation.updatedAt}</Text>
                </View>
                <Text className={['mt-0.5 text-xs', tc.textMuted].join(' ')} numberOfLines={1}>
                  {conversation.company}
                </Text>
                <Text className={['mt-1 text-sm', tc.textSecondary].join(' ')} numberOfLines={1}>
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
