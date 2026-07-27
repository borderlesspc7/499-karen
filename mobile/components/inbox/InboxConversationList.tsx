import { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import type { InboxConversation } from '@shared/types'
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

function ConversationRow({
  conversation,
  isSelected,
  onSelect,
  isDark,
  textPrimary,
  textSecondary,
  textMuted,
  listItemPressed,
}: {
  conversation: InboxConversation
  isSelected: boolean
  onSelect: (conversationId: string) => void
  isDark: boolean
  textPrimary: string
  textSecondary: string
  textMuted: string
  listItemPressed: string
}) {
  return (
    <Pressable
      onPress={() => onSelect(conversation.id)}
      className={[
        'gap-3 border-b px-6 py-5',
        isDark ? 'border-white/[0.04]' : 'border-slate-50/80',
        isSelected ? (isDark ? 'bg-white/[0.04]' : 'bg-slate-50/80') : 'bg-transparent',
        listItemPressed,
      ].join(' ')}
    >
      <View className="flex-row items-start gap-4">
        <View className="relative">
          <InboxChannelIcon channel={conversation.channel} size="lg" />
          <View
            className={[
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2',
              PRIORITY_DOT[conversation.priority],
              isDark ? 'border-navy' : 'border-white',
            ].join(' ')}
          />
        </View>

        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text className={['flex-1 text-base font-semibold', textPrimary].join(' ')} numberOfLines={1}>
              {conversation.contactName}
            </Text>
            <Text className={['text-xs tabular-nums', textMuted].join(' ')}>
              {conversation.updatedAt}
            </Text>
          </View>

          <Text className={['text-sm', textSecondary].join(' ')} numberOfLines={1}>
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
}

export function InboxConversationList({
  conversations,
  selectedId,
  onSelect,
  isCompact = false,
}: InboxConversationListProps) {
  const tc = useThemeClasses()
  const unreadTotal = useMemo(
    () => conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    [conversations],
  )

  const renderItem = useCallback(
    ({ item }: { item: InboxConversation }) => (
      <ConversationRow
        conversation={item}
        isSelected={selectedId === item.id}
        onSelect={onSelect}
        isDark={tc.isDark}
        textPrimary={tc.textPrimary}
        textSecondary={tc.textSecondary}
        textMuted={tc.textMuted}
        listItemPressed={tc.listItemPressed}
      />
    ),
    [onSelect, selectedId, tc.isDark, tc.listItemPressed, tc.textMuted, tc.textPrimary, tc.textSecondary],
  )

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

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  )
}
