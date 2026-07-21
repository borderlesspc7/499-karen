"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markConversationRead = exports.sendInboxMessage = void 0;
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("./config");
const utils_1 = require("./utils");
exports.sendInboxMessage = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const { conversationId, text } = request.data;
    const trimmed = text?.trim();
    if (!conversationId || !trimmed) {
        throw new https_1.HttpsError('invalid-argument', 'Conversa e mensagem são obrigatórias.');
    }
    const userId = request.auth.uid;
    const conversationRef = utils_1.db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Conversa não encontrada.');
    }
    const conversation = conversationDoc.data();
    if (conversation.userId !== userId) {
        throw new https_1.HttpsError('permission-denied', 'Sem permissão para esta conversa.');
    }
    const channel = conversation.channel;
    if (!['whatsapp', 'instagram', 'facebook', 'linkedin'].includes(channel)) {
        throw new https_1.HttpsError('failed-precondition', 'Canal não suporta envio externo.');
    }
    const secret = await (0, utils_1.getChannelSecret)(userId, channel);
    if (!secret) {
        throw new https_1.HttpsError('failed-precondition', `Canal ${channel} não conectado.`);
    }
    const localMessageId = (0, utils_1.generateId)();
    const timestamp = (0, utils_1.formatTimestamp)();
    await conversationRef.collection('messages').doc(localMessageId).set({
        id: localMessageId,
        role: 'agent',
        text: trimmed,
        timestamp,
        deliveryStatus: 'pending',
        createdAt: new Date().toISOString(),
    });
    try {
        const externalMessageId = await dispatchOutboundMessage({
            channel,
            text: trimmed,
            recipientId: conversation.externalContactId ?? conversation.externalThreadId,
            secret,
        });
        await conversationRef.collection('messages').doc(localMessageId).set({
            externalMessageId,
            deliveryStatus: 'sent',
        }, { merge: true });
        await conversationRef.set({
            preview: trimmed,
            updatedAt: timestamp,
            unreadCount: 0,
        }, { merge: true });
        return { messageId: localMessageId, externalMessageId, deliveryStatus: 'sent' };
    }
    catch (error) {
        await conversationRef.collection('messages').doc(localMessageId).set({
            deliveryStatus: 'failed',
        }, { merge: true });
        const message = error instanceof Error ? error.message : 'Falha ao enviar mensagem.';
        throw new https_1.HttpsError('internal', message);
    }
});
async function dispatchOutboundMessage(input) {
    const { channel, text, recipientId, secret } = input;
    if (!recipientId) {
        throw new Error('Contato externo não identificado na conversa.');
    }
    if (channel === 'whatsapp') {
        if (!secret.phoneNumberId || !secret.pageAccessToken) {
            throw new Error('WhatsApp Business não configurado.');
        }
        const response = await fetch(`${config_1.META_GRAPH_BASE}/${secret.phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secret.pageAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: recipientId,
                type: 'text',
                text: { body: text },
            }),
        });
        const payload = (await response.json());
        if (!response.ok) {
            throw new Error(payload.error?.message ?? 'Erro ao enviar WhatsApp.');
        }
        return payload.messages?.[0]?.id ?? (0, utils_1.generateId)();
    }
    if (channel === 'facebook' || channel === 'instagram') {
        if (!secret.pageAccessToken) {
            throw new Error('Página Meta não configurada.');
        }
        const response = await fetch(`${config_1.META_GRAPH_BASE}/me/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secret.pageAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text },
                messaging_type: 'RESPONSE',
            }),
        });
        const payload = (await response.json());
        if (!response.ok) {
            throw new Error(payload.error?.message ?? `Erro ao enviar ${channel}.`);
        }
        return payload.message_id ?? (0, utils_1.generateId)();
    }
    if (channel === 'linkedin') {
        throw new Error('LinkedIn não disponibiliza API pública de inbox para apps terceiros. Conexão ativa para publicação; mensagens inbound requerem parceria LinkedIn.');
    }
    throw new Error('Canal não suportado.');
}
exports.markConversationRead = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const conversationId = request.data?.conversationId;
    if (!conversationId) {
        throw new https_1.HttpsError('invalid-argument', 'Conversa inválida.');
    }
    const conversationRef = utils_1.db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Conversa não encontrada.');
    }
    if (conversationDoc.data()?.userId !== request.auth.uid) {
        throw new https_1.HttpsError('permission-denied', 'Sem permissão.');
    }
    await conversationRef.set({ unreadCount: 0 }, { merge: true });
    return { success: true };
});
//# sourceMappingURL=send-message.js.map