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

function MessageBubble({ message }: { message: InboxMessage }) {
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
            : 'self-start rounded-bl-md border border-slate-200 bg-white',
      ].join(' ')}
    >
      {isAi ? (
        <View className="mb-1 flex-row items-center gap-1">
          <Sparkles size={12} color="#F59E0B" />
          <Text className="text-[10px] font-bold uppercase tracking-wider text-gold">IA</Text>
        </View>
      ) : null}
      <Text
        className={[
          'text-sm leading-5',
          isOutgoing ? 'text-white' : 'text-deepBlue',
        ].join(' ')}
      >
        {message.text}
      </Text>
      <Text
        className={[
          'mt-1 text-[10px]',
          isOutgoing ? 'text-white/70' : 'text-slate-400',
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
      className="flex-1 bg-[#ECEFF3]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View className="border-b border-slate-200 bg-white px-4 py-3">
        <View className="flex-row items-center gap-3">
          {showBackButton ? (
            <Pressable
              onPress={onBack}
              className="rounded-full bg-slate-100 p-2 active:opacity-70"
            >
              <ArrowLeft size={18} color="#0F172A" />
            </Pressable>
          ) : null}

          <InboxChannelIcon channel={conversation.channel} />

          <View className="min-w-0 flex-1">
            <Text className="text-base font-bold text-deepBlue" numberOfLines={1}>
              {conversation.contactName}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: resolveStatusColor(conversation.status) }}
              />
              <Text className="text-xs text-slate-500">
                {resolveStatusLabel(conversation.status)} · {conversation.company}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleAiAction}
            className="flex-row items-center gap-1.5 rounded-full bg-deepBlue px-3 py-2 active:opacity-90"
          >
            <Sparkles size={14} color="#F59E0B" />
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
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <View className="border-t border-slate-200 bg-white px-4 pb-3 pt-3">
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
                className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 active:bg-slate-100"
              >
                <Text className="text-xs font-medium text-slate-600">{template}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View className="flex-row items-end gap-2">
          <Pressable
            onPress={() => Alert.alert('Anexo', 'Upload de arquivo simulado para a demo.')}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 active:bg-slate-100"
          >
            <Paperclip size={18} color="#64748B" />
          </Pressable>

          <Pressable
            onPress={() => setIsTemplatesOpen((current) => !current)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 active:bg-slate-100"
          >
            <ChevronDown
              size={18}
              color="#64748B"
              style={{ transform: [{ rotate: isTemplatesOpen ? '180deg' : '0deg' }] }}
            />
          </Pressable>

          <View className="min-h-[44px] flex-1 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor="#94A3B8"
              multiline
              className="max-h-28 flex-1 py-2 text-sm text-deepBlue"
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
