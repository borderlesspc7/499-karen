"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSmartReplies = exports.generateLeadInsight = exports.generateCampaignContent = exports.openaiApiKey = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
exports.openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
async function callOpenAiJson(input) {
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
    });
    if (!response.ok) {
        const body = await response.text();
        throw new https_1.HttpsError('internal', `OpenAI error: ${response.status} ${body.slice(0, 200)}`);
    }
    const payload = (await response.json());
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
        throw new https_1.HttpsError('internal', 'Resposta vazia do provedor de IA.');
    }
    try {
        return JSON.parse(content);
    }
    catch {
        throw new https_1.HttpsError('internal', 'Resposta da IA não é JSON válido.');
    }
}
function requireAuth(request) {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Autenticação obrigatória.');
    }
}
function requireApiKey() {
    const apiKey = exports.openaiApiKey.value();
    if (!apiKey?.trim()) {
        throw new https_1.HttpsError('failed-precondition', 'OPENAI_API_KEY não configurada. Defina o secret no Firebase Functions.');
    }
    return apiKey;
}
exports.generateCampaignContent = (0, https_1.onCall)({ secrets: [exports.openaiApiKey] }, async (request) => {
    requireAuth(request);
    const apiKey = requireApiKey();
    const data = request.data;
    if (!data?.objective || !data?.audience || !data?.offer) {
        throw new https_1.HttpsError('invalid-argument', 'objective, audience e offer são obrigatórios.');
    }
    const language = data.language ?? 'pt-BR';
    const parsed = (await callOpenAiJson({
        apiKey,
        system: 'Você é um copywriter B2B. Responda apenas JSON com as chaves: headline, body, cta, channelCopy (instagram, linkedin, email), estimatedLeads (number).',
        user: JSON.stringify({
            objective: data.objective,
            audience: data.audience,
            offer: data.offer,
            brandContext: data.brandContext ?? null,
            tone: data.tone ?? 'premium',
            language,
        }),
    }));
    const channelCopy = (parsed.channelCopy ?? {});
    return {
        headline: String(parsed.headline ?? ''),
        body: String(parsed.body ?? ''),
        cta: String(parsed.cta ?? ''),
        channelCopy: {
            instagram: channelCopy.instagram,
            linkedin: channelCopy.linkedin,
            email: channelCopy.email,
        },
        estimatedLeads: typeof parsed.estimatedLeads === 'number' ? parsed.estimatedLeads : undefined,
        provider: 'openai',
    };
});
exports.generateLeadInsight = (0, https_1.onCall)({ secrets: [exports.openaiApiKey] }, async (request) => {
    requireAuth(request);
    const apiKey = requireApiKey();
    const data = request.data;
    if (!data?.leadTitle || !data?.columnTitle) {
        throw new https_1.HttpsError('invalid-argument', 'leadTitle e columnTitle são obrigatórios.');
    }
    const parsed = (await callOpenAiJson({
        apiKey,
        system: 'Você é um coach comercial. Responda JSON com: nextBestAction, rationale, urgency (low|medium|high).',
        user: JSON.stringify(data),
    }));
    const urgency = parsed.urgency;
    const normalizedUrgency = urgency === 'low' || urgency === 'medium' || urgency === 'high' ? urgency : 'medium';
    return {
        nextBestAction: String(parsed.nextBestAction ?? ''),
        rationale: String(parsed.rationale ?? ''),
        urgency: normalizedUrgency,
        provider: 'openai',
    };
});
exports.generateSmartReplies = (0, https_1.onCall)({ secrets: [exports.openaiApiKey] }, async (request) => {
    requireAuth(request);
    const apiKey = requireApiKey();
    const data = request.data;
    if (!data?.contactName || !data?.channel) {
        throw new https_1.HttpsError('invalid-argument', 'contactName e channel são obrigatórios.');
    }
    const parsed = (await callOpenAiJson({
        apiKey,
        system: 'Você sugere respostas curtas para inbox comercial. Responda JSON com: replies (array de 3 strings curtas em pt-BR).',
        user: JSON.stringify(data),
    }));
    const replies = Array.isArray(parsed.replies)
        ? parsed.replies.map((item) => String(item)).filter(Boolean).slice(0, 3)
        : [];
    return {
        replies,
        provider: 'openai',
    };
});
//# sourceMappingURL=ai-orchestration.js.map