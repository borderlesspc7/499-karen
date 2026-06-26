import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { InboxChatView, InboxConversationList } from '@/components/inbox'
import { inboxConversations } from '@/constants/inbox-mock-data'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

const SPLIT_LAYOUT_MIN_WIDTH = 768

export default function InboxScreen() {
  const { width, isWebDesktop } = useResponsiveLayout()
  const isSplitLayout = isWebDesktop || width >= SPLIT_LAYOUT_MIN_WIDTH

  const [selectedId, setSelectedId] = useState<string | null>(
    isSplitLayout ? inboxConversations[0]?.id ?? null : null,
  )

  const selectedConversation = useMemo(
    () => inboxConversations.find((conversation) => conversation.id === selectedId) ?? null,
    [selectedId],
  )

  function handleSelectConversation(conversationId: string) {
    setSelectedId(conversationId)
  }

  function handleBackToList() {
    setSelectedId(null)
  }

  if (!isSplitLayout && selectedConversation) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
        <InboxChatView
          conversation={selectedConversation}
          onBack={handleBackToList}
          showBackButton
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-1 flex-row">
        <View className={isSplitLayout ? 'w-[340px]' : 'flex-1'}>
          <InboxConversationList
            conversations={inboxConversations}
            selectedId={selectedId}
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
    </SafeAreaView>
  )
}

function InboxEmptyState() {
  return (
    <View className="flex-1 items-center justify-center bg-[#ECEFF3] px-8">
      <Text className="text-lg font-semibold text-deepBlue">Selecione uma conversa</Text>
      <Text className="mt-2 text-center text-sm text-slate-500">
        Escolha um contato na lista para visualizar o histórico omnichannel.
      </Text>
    </View>
  )
}
