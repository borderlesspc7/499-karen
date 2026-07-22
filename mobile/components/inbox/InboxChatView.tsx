import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { ArrowLeft, Send, Sparkles } from 'lucide-react-native'
import { generateSmartReplies } from '@shared/services/ai-orchestration-service'
import type { InboxContactStatus, InboxConversation, InboxMessage } from '@shared/types'
import { INBOX_QUICK_TEMPLATES } from '@/constants/inbox-templates'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { markConversationRead, sendInboxMessage } from '@/lib/messaging-service'
import { InboxAiSummary } from './InboxAiSummary'
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
  const isFailed = message.deliveryStatus === 'failed'
  const isPending = message.deliveryStatus === 'pending'

  return (
    <View
      className={[
        'max-w-[85%] rounded-2xl px-4 py-3',
        isOutgoing
          ? 'self-end rounded-br-md bg-navy'
          : isAi
            ? 'self-start rounded-bl-md border border-gold/20 bg-gold/5'
            : ['self-start rounded-bl-md', incomingBubbleClass].join(' '),
      ].join(' ')}
    >
      {isAi ? (
        <View className="mb-1 flex-row items-center gap-1">
          <Sparkles size={10} color={premiumColors.gold} />
          <Text className="text-[10px] font-bold uppercase tracking-wider text-gold">IA</Text>
        </View>
      ) : null}
      <Text
        className={['text-sm leading-5', isOutgoing ? 'text-white' : textPrimaryClass].join(' ')}
      >
        {message.text}
      </Text>
      <View className="mt-1 flex-row items-center gap-2">
        <Text
          className={['text-[10px]', isOutgoing ? 'text-white/60' : textMutedClass].join(' ')}
        >
          {message.timestamp}
        </Text>
        {isOutgoing && isPending ? (
          <Text className="text-[10px] text-white/60">Enviando…</Text>
        ) : null}
        {isOutgoing && isFailed ? (
          <Text className="text-[10px] text-rose-300">Falhou</Text>
        ) : null}
      </View>
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
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState(conversation.messages)

  useEffect(() => {
    setMessages(conversation.messages)
    void markConversationRead(conversation.id).catch(() => undefined)
  }, [conversation.id, conversation.messages])

  const [smartReplies, setSmartReplies] = useState<string[]>([...INBOX_QUICK_TEMPLATES])

  useEffect(() => {
    let isMounted = true

    void generateSmartReplies({
      contactName: conversation.contactName,
      channel: conversation.channel,
      preview: conversation.preview,
      lastMessages: conversation.messages.slice(-4).map((message) => message.text),
    })
      .then((response) => {
        if (isMounted && response.replies.length > 0) {
          setSmartReplies(response.replies)
        }
      })
      .catch(() => {
        if (isMounted) {
          setSmartReplies([...INBOX_QUICK_TEMPLATES])
        }
      })

    return () => {
      isMounted = false
    }
  }, [conversation.id, conversation.contactName, conversation.channel, conversation.preview, conversation.messages])

  const canSendExternally = ['whatsapp', 'instagram', 'facebook'].includes(conversation.channel)

  async function handleSend(text?: string) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isSending) return

    const optimisticId = `local-${Date.now()}`
    setMessages((current) => [
      ...current,
      {
        id: optimisticId,
        role: 'agent',
        text: trimmed,
        timestamp: 'Agora',
        deliveryStatus: 'pending',
      },
    ])
    setInput('')
    setIsSending(true)

    try {
      if (canSendExternally && conversation.externalContactId) {
        await sendInboxMessage(conversation.id, trimmed)
      } else if (canSendExternally) {
        throw new Error('Conversa sem contato externo vinculado.')
      } else {
        Alert.alert(
          'Canal não conectado',
          conversation.channel === 'linkedin'
            ? 'LinkedIn inbox requer parceria API. Conecte WhatsApp, Instagram ou Facebook para responder pelo app.'
            : 'Conecte o canal nas Integrações para enviar mensagens reais.',
        )
      }
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId ? { ...message, deliveryStatus: 'failed' } : message,
        ),
      )
      Alert.alert(
        'Erro ao enviar',
        error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.',
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className={['flex-1', tc.isDark ? 'bg-navy' : 'bg-white'].join(' ')}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View
        className={[
          'border-b px-5 py-4',
          tc.isDark ? 'border-white/5 bg-navy' : 'border-slate-50 bg-white',
        ].join(' ')}
      >
        <View className="flex-row items-center gap-4">
          {showBackButton ? (
            <Pressable onPress={onBack} className="rounded-full p-2 active:opacity-70">
              <ArrowLeft size={20} color={tc.isDark ? '#F8FAFC' : premiumColors.navy} />
            </Pressable>
          ) : null}

          <InboxChannelIcon channel={conversation.channel} size="lg" />

          <View className="min-w-0 flex-1">
            <Text className={['text-lg font-bold', tc.textPrimary].join(' ')} numberOfLines={1}>
              {conversation.contactName}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: resolveStatusColor(conversation.status) }}
              />
              <Text className={['text-xs', tc.textMuted].join(' ')}>
                {resolveStatusLabel(conversation.status)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4">
          <InboxAiSummary
            summary={conversation.aiSummary}
            estimatedValue={conversation.estimatedValue}
            priority={conversation.priority}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-4 py-6"
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

      <View
        className={[
          'gap-3 border-t px-5 pb-4 pt-4',
          tc.isDark ? 'border-white/5 bg-navy' : 'border-slate-50 bg-white',
        ].join(' ')}
      >
        {smartReplies.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {smartReplies.map((reply) => (
              <Pressable
                key={reply}
                onPress={() => handleSend(reply)}
                className={[
                  'rounded-full border px-4 py-2 active:opacity-80',
                  tc.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50',
                ].join(' ')}
              >
                <Text className={['text-xs font-medium', tc.textLabel].join(' ')}>{reply}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View className="flex-row items-end gap-3">
          <View
            className={[
              'min-h-[48px] flex-1 flex-row items-center rounded-2xl border px-4',
              tc.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50',
            ].join(' ')}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={tc.placeholderColor}
              multiline
              editable={!isSending}
              className={['max-h-24 flex-1 py-3 text-sm', tc.textPrimary].join(' ')}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
          </View>

          <Pressable
            onPress={() => handleSend()}
            disabled={isSending}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-navy active:opacity-90"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
