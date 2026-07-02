import { useMemo, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  ArrowLeft,
  ChevronDown,
  Paperclip,
  Send,
  Sparkles,
} from 'lucide-react-native'
import type { InboxContactStatus, InboxConversation, InboxMessage } from '@/constants/inbox-mock-data'
import {
  INBOX_AI_SUGGESTIONS,
  INBOX_QUICK_TEMPLATES,
} from '@/constants/inbox-mock-data'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { InboxChannelIcon } from './InboxChannelIcon'

type InboxChatViewProps = {
  conversation: InboxConversation
  onBack?: () => void
  showBackButton?: boolean
}

function resolveStatusLabel(status: InboxContactStatus): string {
  const labels: Record<InboxContactStatus, string> = {
    online: 'Online',
    away: 'Ausente',
    offline: 'Offline',
  }

  return labels[status]
}

function resolveStatusColor(status: InboxContactStatus): string {
  const colors: Record<InboxContactStatus, string> = {
    online: '#10B981',
    away: '#F59E0B',
    offline: '#94A3B8',
  }

  return colors[status]
}

function MessageBubble({
  message,
  incomingBubbleClass,
  textPrimaryClass,
  textMutedClass,
}: {
  message: InboxMessage
  incomingBubbleClass: string
  textPrimaryClass: string
  textMutedClass: string
}) {
  const isOutgoing = message.role === 'agent'
  const isAi = message.role === 'ai'

  return (
    <View
      className={[
        'max-w-[85%] rounded-2xl px-4 py-3',
        isOutgoing
          ? 'self-end rounded-br-md bg-electricBlue'
          : isAi
            ? 'self-start rounded-bl-md border border-gold/30 bg-gold/10'
            : ['self-start rounded-bl-md', incomingBubbleClass].join(' '),
      ].join(' ')}
    >
      {isAi ? (
        <View className="mb-1 flex-row items-center gap-1">
          <Sparkles size={12} color={premiumColors.gold} />
          <Text className="text-[10px] font-bold uppercase tracking-wider text-gold">IA</Text>
        </View>
      ) : null}
      <Text
        className={[
          'text-sm leading-5',
          isOutgoing ? 'text-white' : textPrimaryClass,
        ].join(' ')}
      >
        {message.text}
      </Text>
      <Text
        className={[
          'mt-1 text-[10px]',
          isOutgoing ? 'text-white/70' : textMutedClass,
        ].join(' ')}
      >
        {message.timestamp}
      </Text>
    </View>
  )
}

export function InboxChatView({
  conversation,
  onBack,
  showBackButton = false,
}: InboxChatViewProps) {
  const tc = useThemeClasses()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(conversation.messages)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)

  const aiSuggestion = useMemo(
    () => INBOX_AI_SUGGESTIONS[conversation.id] ?? 'Sugestão IA: Responder com empatia e propor próximo passo claro.',
    [conversation.id],
  )

  function handleSend(text?: string) {
    const trimmed = (text ?? input).trim()
    if (!trimmed) {
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        role: 'agent',
        text: trimmed,
        timestamp: 'Agora',
      },
    ])
    setInput('')
    setIsTemplatesOpen(false)
  }

  function handleAiAction() {
    Alert.alert('Ações IA', aiSuggestion, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Usar sugestão',
        onPress: () => {
          const suggestionText = aiSuggestion.replace(/^Sugestão IA:\s*/i, '')
          handleSend(suggestionText)
        },
      },
    ])
  }

  return (
    <KeyboardAvoidingView
      className={['flex-1', tc.chatBg].join(' ')}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View className={['border-b px-4 py-3', tc.toolbar].join(' ')}>
        <View className="flex-row items-center gap-3">
          {showBackButton ? (
            <Pressable onPress={onBack} className={['rounded-full p-2', tc.iconButton].join(' ')}>
              <ArrowLeft size={18} color={tc.isDark ? '#F8FAFC' : premiumColors.navy} />
            </Pressable>
          ) : null}

          <InboxChannelIcon channel={conversation.channel} />

          <View className="min-w-0 flex-1">
            <Text className={['text-base font-bold', tc.textPrimary].join(' ')} numberOfLines={1}>
              {conversation.contactName}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: resolveStatusColor(conversation.status) }}
              />
              <Text className={['text-xs', tc.textSecondary].join(' ')}>
                {resolveStatusLabel(conversation.status)} · {conversation.company}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleAiAction}
            className="flex-row items-center gap-1.5 rounded-full bg-navy px-3 py-2 active:opacity-90"
          >
            <Sparkles size={14} color={premiumColors.gold} />
            <Text className="text-xs font-bold text-white">Ações IA</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="gap-3 py-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            incomingBubbleClass={tc.incomingBubble}
            textPrimaryClass={tc.textPrimary}
            textMutedClass={tc.textMuted}
          />
        ))}
      </ScrollView>

      <View className={['border-t px-4 pb-3 pt-3', tc.toolbar].join(' ')}>
        {isTemplatesOpen ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="mb-3 gap-2"
          >
            {INBOX_QUICK_TEMPLATES.map((template) => (
              <Pressable
                key={template}
                onPress={() => handleSend(template)}
                className={['rounded-full border px-3.5 py-2', tc.iconButton].join(' ')}
              >
                <Text className={['text-xs font-medium', tc.textLabel].join(' ')}>{template}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View className="flex-row items-end gap-2">
          <Pressable
            onPress={() => Alert.alert('Anexo', 'Upload de arquivo simulado para a demo.')}
            className={['rounded-xl p-3', tc.iconButton].join(' ')}
          >
            <Paperclip size={18} color={tc.chevron} />
          </Pressable>

          <Pressable
            onPress={() => setIsTemplatesOpen((current) => !current)}
            className={['rounded-xl p-3', tc.iconButton].join(' ')}
          >
            <ChevronDown
              size={18}
              color={tc.chevron}
              style={{ transform: [{ rotate: isTemplatesOpen ? '180deg' : '0deg' }] }}
            />
          </Pressable>

          <View className={['min-h-[44px] flex-1 flex-row items-center', tc.inputInline].join(' ')}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={tc.placeholderColor}
              multiline
              className={['max-h-28 flex-1 py-2 text-sm', tc.textPrimary].join(' ')}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
          </View>

          <Pressable
            onPress={() => handleSend()}
            className="rounded-xl bg-electricBlue p-3 active:opacity-90"
          >
            <Send size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
