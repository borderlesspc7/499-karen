"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaWebhook = void 0;
const crypto_1 = require("crypto");
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("./config");
const utils_1 = require("./utils");
function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
    if (!signatureHeader?.startsWith('sha256=')) {
        return false;
    }
    const expected = (0, crypto_1.createHmac)('sha256', appSecret)
        .update(rawBody)
        .digest('hex');
    return signatureHeader.slice(7) === expected;
}
exports.metaWebhook = (0, https_1.onRequest)({
    secrets: [config_1.metaAppSecret, config_1.metaWebhookVerifyToken],
    cors: false,
}, async (request, response) => {
    if (request.method === 'GET') {
        const mode = request.query['hub.mode'];
        const token = request.query['hub.verify_token'];
        const challenge = request.query['hub.challenge'];
        if (mode === 'subscribe' && token === config_1.metaWebhookVerifyToken.value()) {
            response.status(200).send(challenge);
            return;
        }
        response.status(403).send('Forbidden');
        return;
    }
    const rawBody = request.rawBody;
    const signature = request.get('X-Hub-Signature-256');
    if (!verifyMetaSignature(rawBody, signature, config_1.metaAppSecret.value())) {
        response.status(401).send('Invalid signature');
        return;
    }
    const body = request.body;
    try {
        if (body.object === 'whatsapp_business_account') {
            await handleWhatsAppWebhook(body);
        }
        else if (body.object === 'page') {
            await handleMessengerWebhook(body, 'facebook');
        }
        else if (body.object === 'instagram') {
            await handleInstagramWebhook(body.entry);
        }
    }
    catch (error) {
        console.error('[metaWebhook] processing error', error);
    }
    response.status(200).send('EVENT_RECEIVED');
});
async function handleWhatsAppWebhook(body) {
    for (const entry of body.entry ?? []) {
        for (const change of entry.changes ?? []) {
            const value = change.value;
            const phoneNumberId = value?.metadata?.phone_number_id;
            if (!phoneNumberId) {
                continue;
            }
            const userId = await (0, utils_1.findUserIdByPhoneNumberId)(phoneNumberId);
            if (!userId) {
                continue;
            }
            for (const message of value.messages ?? []) {
                if (message.type !== 'text' || !message.text?.body) {
                    continue;
                }
                const contact = value.contacts?.find((item) => item.wa_id === message.from);
                const contactName = contact?.profile?.name ?? message.from;
                await (0, utils_1.upsertInboundMessage)({
                    userId,
                    channel: 'whatsapp',
                    externalThreadId: message.from,
                    externalContactId: message.from,
                    contactName,
                    messageText: message.text.body,
                    externalMessageId: message.id,
                });
            }
        }
    }
}
async function handleMessengerWebhook(body, channel) {
    for (const entry of body.entry ?? []) {
        const pageId = entry.id;
        if (!pageId) {
            continue;
        }
        const userId = await (0, utils_1.findUserIdByPageId)(pageId);
        if (!userId) {
            continue;
        }
        for (const event of entry.messaging ?? []) {
            const text = event.message?.text;
            const messageId = event.message?.mid;
            const senderId = event.sender?.id;
            if (!text || !messageId || !senderId) {
                continue;
            }
            await (0, utils_1.upsertInboundMessage)({
                userId,
                channel,
                externalThreadId: senderId,
                externalContactId: senderId,
                contactName: event.sender?.name ?? `Contato ${senderId.slice(-4)}`,
                messageText: text,
                externalMessageId: messageId,
            });
        }
    }
}
async function handleInstagramWebhook(entries) {
    for (const entry of entries ?? []) {
        const pageId = entry.id;
        if (!pageId) {
            continue;
        }
        const userId = await (0, utils_1.findUserIdByPageId)(pageId);
        if (!userId) {
            continue;
        }
        for (const event of entry.messaging ?? []) {
            const text = event.message?.text;
            const messageId = event.message?.mid;
            const senderId = event.sender?.id;
            if (!text || !messageId || !senderId) {
                continue;
            }
            await (0, utils_1.upsertInboundMessage)({
                userId,
                channel: 'instagram',
                externalThreadId: senderId,
                externalContactId: senderId,
                contactName: event.sender?.name ?? `Instagram ${senderId.slice(-4)}`,
                messageText: text,
                externalMessageId: messageId,
            });
        }
        for (const change of entry.changes ?? []) {
            if (change.field !== 'messages') {
                continue;
            }
            const text = change.value?.message?.text;
            const messageId = change.value?.message?.mid;
            const senderId = change.value?.sender?.id;
            if (!text || !messageId || !senderId) {
                continue;
            }
            await (0, utils_1.upsertInboundMessage)({
                userId,
                channel: 'instagram',
                externalThreadId: senderId,
                externalContactId: senderId,
                contactName: `Instagram ${senderId.slice(-4)}`,
                messageText: text,
                externalMessageId: messageId,
            });
        }
    }
}
//# sourceMappingURL=meta-webhook.js.map