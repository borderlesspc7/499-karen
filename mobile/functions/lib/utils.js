"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.generateId = generateId;
exports.signOAuthState = signOAuthState;
exports.buildOAuthState = buildOAuthState;
exports.parseOAuthState = parseOAuthState;
exports.saveChannelSecret = saveChannelSecret;
exports.getChannelSecret = getChannelSecret;
exports.saveChannelConnection = saveChannelConnection;
exports.findUserIdByPageId = findUserIdByPageId;
exports.findUserIdByPhoneNumberId = findUserIdByPhoneNumberId;
exports.formatTimestamp = formatTimestamp;
exports.upsertInboundMessage = upsertInboundMessage;
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.db = admin.firestore();
function generateId() {
    return (0, crypto_1.randomBytes)(12).toString('hex');
}
function signOAuthState(payload, secret) {
    return (0, crypto_1.createHmac)('sha256', secret).update(payload).digest('hex');
}
function buildOAuthState(userId, channel, secret) {
    const nonce = generateId();
    const payload = `${userId}:${channel}:${nonce}:${Date.now()}`;
    const signature = signOAuthState(payload, secret);
    return Buffer.from(`${payload}:${signature}`).toString('base64url');
}
function parseOAuthState(state, secret) {
    try {
        const decoded = Buffer.from(state, 'base64url').toString('utf8');
        const parts = decoded.split(':');
        if (parts.length !== 5) {
            return null;
        }
        const [userId, channel, , , signature] = parts;
        const payload = parts.slice(0, 4).join(':');
        const expected = signOAuthState(payload, secret);
        if (signature !== expected) {
            return null;
        }
        if (!['whatsapp', 'instagram', 'facebook', 'linkedin'].includes(channel)) {
            return null;
        }
        return { userId, channel: channel };
    }
    catch {
        return null;
    }
}
async function saveChannelSecret(userId, channel, secret) {
    await exports.db
        .collection('integration_secrets')
        .doc(userId)
        .collection('channels')
        .doc(channel)
        .set({
        ...secret,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}
async function getChannelSecret(userId, channel) {
    const document = await exports.db
        .collection('integration_secrets')
        .doc(userId)
        .collection('channels')
        .doc(channel)
        .get();
    if (!document.exists) {
        return null;
    }
    return document.data();
}
async function saveChannelConnection(userId, channel, data) {
    await exports.db
        .collection('channel_connections')
        .doc(userId)
        .collection('channels')
        .doc(channel)
        .set({
        channel,
        ...data,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}
async function findUserIdByPageId(pageId) {
    const snapshot = await exports.db
        .collectionGroup('channels')
        .where('pageId', '==', pageId)
        .where('status', '==', 'connected')
        .limit(1)
        .get();
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].ref.parent.parent?.id ?? null;
}
async function findUserIdByPhoneNumberId(phoneNumberId) {
    const snapshot = await exports.db
        .collectionGroup('channels')
        .where('phoneNumberId', '==', phoneNumberId)
        .where('status', '==', 'connected')
        .limit(1)
        .get();
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].ref.parent.parent?.id ?? null;
}
function formatTimestamp(date = new Date()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
async function upsertInboundMessage(input) {
    const conversationId = `${input.channel}-${input.externalThreadId}`;
    const conversationRef = exports.db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    const now = formatTimestamp();
    if (!conversationDoc.exists) {
        await conversationRef.set({
            id: conversationId,
            userId: input.userId,
            contactName: input.contactName,
            company: '—',
            preview: input.preview ?? input.messageText,
            channel: input.channel,
            status: 'online',
            unreadCount: 1,
            updatedAt: now,
            priority: 'warm',
            aiSummary: `Nova mensagem via ${input.channel}`,
            estimatedValue: 0,
            externalThreadId: input.externalThreadId,
            externalContactId: input.externalContactId,
            createdAt: new Date().toISOString(),
        });
    }
    else {
        await conversationRef.set({
            preview: input.preview ?? input.messageText,
            updatedAt: now,
            unreadCount: admin.firestore.FieldValue.increment(1),
            status: 'online',
        }, { merge: true });
    }
    await conversationRef.collection('messages').doc(input.externalMessageId).set({
        id: input.externalMessageId,
        role: 'contact',
        text: input.messageText,
        timestamp: now,
        externalMessageId: input.externalMessageId,
        deliveryStatus: 'delivered',
        createdAt: new Date().toISOString(),
    });
}
//# sourceMappingURL=utils.js.map