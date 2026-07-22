import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

export const openaiApiKey = defineSecret('OPENAI_API_KEY')

type CampaignRequest = {
  objective: string
  audience: string
  offer: string
  brandContext?: string | null
  tone?: 'premium' | 'direct' | 'educational'
  language?: 'pt-BR' | 'en-US'
}

type LeadInsightRequest = {
  leadTitle: string
  columnTitle: string
  clientName?: string
  recentNotes?: string
}

type SmartRepliesRequest = {
  contactName: string
  channel: string
  preview: string
  lastMessages?: string[]
}

async function callOpenAiJson(input: {
  apiKey: string
  system: string
  user: string
}): Promise<unknown> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new HttpsError('internal', `OpenAI error: ${response.status} ${body.slice(0, 200)}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw new HttpsError('internal', 'Resposta vazia do provedor de IA.')
  }

  try {
    return JSON.parse(content) as unknown
  } catch {
    throw new HttpsError('internal', 'Resposta da IA não é JSON válido.')
  }
}

function requireAuth(request: { auth?: { uid: string } | null }) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Autenticação obrigatória.')
  }
}

function requireApiKey() {
  const apiKey = openaiApiKey.value()
  if (!apiKey?.trim()) {
    throw new HttpsError(
      'failed-precondition',
      'OPENAI_API_KEY não configurada. Defina o secret no Firebase Functions.',
    )
  }
  return apiKey
}

export const generateCampaignContent = onCall({ secrets: [openaiApiKey] }, async (request) => {
  requireAuth(request)
  const apiKey = requireApiKey()
  const data = request.data as CampaignRequest

  if (!data?.objective || !data?.audience || !data?.offer) {
    throw new HttpsError('invalid-argument', 'objective, audience e offer são obrigatórios.')
  }

  const language = data.language ?? 'pt-BR'
  const parsed = (await callOpenAiJson({
    apiKey,
    system:
      'Você é um copywriter B2B. Responda apenas JSON com as chaves: headline, body, cta, channelCopy (instagram, linkedin, email), estimatedLeads (number).',
    user: JSON.stringify({
      objective: data.objective,
      audience: data.audience,
      offer: data.offer,
      brandContext: data.brandContext ?? null,
      tone: data.tone ?? 'premium',
      language,
    }),
  })) as Record<string, unknown>

  const channelCopy = (parsed.channelCopy ?? {}) as Record<string, string>

  return {
    headline: String(parsed.headline ?? ''),
    body: String(parsed.body ?? ''),
    cta: String(parsed.cta ?? ''),
    channelCopy: {
      instagram: channelCopy.instagram,
      linkedin: channelCopy.linkedin,
      email: channelCopy.email,
    },
    estimatedLeads:
      typeof parsed.estimatedLeads === 'number' ? parsed.estimatedLeads : undefined,
    provider: 'openai' as const,
  }
})

export const generateLeadInsight = onCall({ secrets: [openaiApiKey] }, async (request) => {
  requireAuth(request)
  const apiKey = requireApiKey()
  const data = request.data as LeadInsightRequest

  if (!data?.leadTitle || !data?.columnTitle) {
    throw new HttpsError('invalid-argument', 'leadTitle e columnTitle são obrigatórios.')
  }

  const parsed = (await callOpenAiJson({
    apiKey,
    system:
      'Você é um coach comercial. Responda JSON com: nextBestAction, rationale, urgency (low|medium|high).',
    user: JSON.stringify(data),
  })) as Record<string, unknown>

  const urgency = parsed.urgency
  const normalizedUrgency =
    urgency === 'low' || urgency === 'medium' || urgency === 'high' ? urgency : 'medium'

  return {
    nextBestAction: String(parsed.nextBestAction ?? ''),
    rationale: String(parsed.rationale ?? ''),
    urgency: normalizedUrgency,
    provider: 'openai' as const,
  }
})

export const generateSmartReplies = onCall({ secrets: [openaiApiKey] }, async (request) => {
  requireAuth(request)
  const apiKey = requireApiKey()
  const data = request.data as SmartRepliesRequest

  if (!data?.contactName || !data?.channel) {
    throw new HttpsError('invalid-argument', 'contactName e channel são obrigatórios.')
  }

  const parsed = (await callOpenAiJson({
    apiKey,
    system:
      'Você sugere respostas curtas para inbox comercial. Responda JSON com: replies (array de 3 strings curtas em pt-BR).',
    user: JSON.stringify(data),
  })) as { replies?: unknown }

  const replies = Array.isArray(parsed.replies)
    ? parsed.replies.map((item) => String(item)).filter(Boolean).slice(0, 3)
    : []

  return {
    replies,
    provider: 'openai' as const,
  }
})
