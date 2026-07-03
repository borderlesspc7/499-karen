import { Pressable, ScrollView, Text, View } from 'react-native'
import type { InboxConversation } from '@/constants/inbox-mock-data'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { InboxAiSummary } from './InboxAiSummary'
import { InboxChannelIcon } from './InboxChannelIcon'

type InboxConversationListProps = {
  conversations: InboxConversation[]
  selectedId: string | null
  onSelect: (conversationId: string) => void
  isCompact?: boolean
}

const PRIORITY_DOT: Record<InboxConversation['priority'], string> = {
  hot: 'bg-red-500',
  warm: 'bg-amber-400',
  cold: 'bg-slate-300',
}

export function InboxConversationList({
  conversations,
  selectedId,
  onSelect,
  isCompact = false,
}: InboxConversationListProps) {
  const tc = useThemeClasses()
  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <View
      className={[
        'flex-1',
        tc.isDark ? 'bg-navy' : 'bg-white',
        isCompact ? `border-r ${tc.isDark ? 'border-white/10' : 'border-slate-100'}` : '',
      ].join(' ')}
    >
      <View className={['px-6 pb-5 pt-8', tc.isDark ? 'border-b border-white/5' : 'border-b border-slate-50'].join(' ')}>
        <View className="flex-row items-baseline justify-between">
          <Text className={['text-2xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
            Inbox
          </Text>
          {unreadTotal > 0 ? (
            <Text className={['text-sm tabular-nums', tc.textMuted].join(' ')}>
              {unreadTotal} não lidas
            </Text>
          ) : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {conversations.map((conversation) => {
          const isSelected = selectedId === conversation.id

          return (
            <Pressable
              key={conversation.id}
              onPress={() => onSelect(conversation.id)}
              className={[
                'gap-3 border-b px-6 py-5',
                tc.isDark ? 'border-white/[0.04]' : 'border-slate-50/80',
                isSelected
                  ? tc.isDark
                    ? 'bg-white/[0.04]'
                    : 'bg-slate-50/80'
                  : 'bg-transparent',
                tc.listItemPressed,
              ].join(' ')}
            >
              <View className="flex-row items-start gap-4">
                <View className="relative">
                  <InboxChannelIcon channel={conversation.channel} size="lg" />
                  <View
                    className={[
                      'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2',
                      PRIORITY_DOT[conversation.priority],
                      tc.isDark ? 'border-navy' : 'border-white',
                    ].join(' ')}
                  />
                </View>

                <View className="min-w-0 flex-1 gap-1.5">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      className={['flex-1 text-base font-semibold', tc.textPrimary].join(' ')}
                      numberOfLines={1}
                    >
                      {conversation.contactName}
                    </Text>
                    <Text className={['text-xs tabular-nums', tc.textMuted].join(' ')}>
                      {conversation.updatedAt}
                    </Text>
                  </View>

                  <Text className={['text-sm', tc.textSecondary].join(' ')} numberOfLines={1}>
                    {conversation.preview}
                  </Text>

                  <InboxAiSummary
                    summary={conversation.aiSummary}
                    estimatedValue={conversation.estimatedValue}
                    priority={conversation.priority}
                    compact
                  />
                </View>
              </View>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
