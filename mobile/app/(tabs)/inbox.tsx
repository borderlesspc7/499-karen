import { useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { InboxChatView, InboxConversationList } from '@/components/inbox'
import { useInboxConversations } from '@/hooks/useInboxConversations'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const SPLIT_LAYOUT_MIN_WIDTH = 768

export default function InboxScreen() {
  const { width, isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const isSplitLayout = isWebDesktop || width >= SPLIT_LAYOUT_MIN_WIDTH
  const { conversations, isLoading, error } = useInboxConversations()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const effectiveSelectedId = useMemo(() => {
    if (selectedId) {
      return selectedId
    }
    if (isSplitLayout && conversations.length > 0) {
      return conversations[0]?.id ?? null
    }
    return null
  }, [conversations, isSplitLayout, selectedId])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === effectiveSelectedId) ?? null,
    [conversations, effectiveSelectedId],
  )

  function handleSelectConversation(conversationId: string) {
    setSelectedId(conversationId)
  }

  function handleBackToList() {
    setSelectedId(null)
  }

  if (isLoading) {
    return (
      <ThemedScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C5A059" />
        </View>
      </ThemedScreen>
    )
  }

  if (error) {
    return (
      <ThemedScreen>
        <View className="flex-1 items-center justify-center px-8">
          <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>{error}</Text>
        </View>
      </ThemedScreen>
    )
  }

  if (!isSplitLayout && selectedConversation) {
    return (
      <ThemedScreen>
        <InboxChatView
          conversation={selectedConversation}
          onBack={handleBackToList}
          showBackButton
        />
      </ThemedScreen>
    )
  }

  return (
    <ThemedScreen>
      <View className="flex-1 flex-row">
        <View className={isSplitLayout ? 'w-[340px]' : 'flex-1'}>
          <InboxConversationList
            conversations={conversations}
            selectedId={effectiveSelectedId}
            onSelect={handleSelectConversation}
            isCompact={isSplitLayout}
          />
        </View>

        {isSplitLayout ? (
          <View className="flex-1">
            {selectedConversation ? (
              <InboxChatView conversation={selectedConversation} />
            ) : (
              <InboxEmptyState />
            )}
          </View>
        ) : null}
      </View>
    </ThemedScreen>
  )
}

function InboxEmptyState() {
  const tc = useThemeClasses()

  return (
    <View className={['flex-1 items-center justify-center px-8', tc.chatBg].join(' ')}>
      <Text className={['text-lg font-semibold', tc.textPrimary].join(' ')}>
        Selecione uma conversa
      </Text>
      <Text className={['mt-2 text-center text-sm', tc.textSecondary].join(' ')}>
        Escolha um contato na lista para visualizar o histórico omnichannel.
      </Text>
    </View>
  )
}
