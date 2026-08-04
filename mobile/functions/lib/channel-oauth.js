"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectChannel = exports.getChannelConnections = exports.startChannelOAuth = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_check_1 = require("./app-check");
const config_1 = require("./config");
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const rate_limit_1 = require("./rate-limit");
const META_CHANNELS = new Set(['whatsapp', 'instagram', 'facebook']);
exports.startChannelOAuth = (0, https_1.onCall)({
    secrets: [config_1.metaAppSecret],
    cors: true,
    enforceAppCheck: app_check_1.ENFORCE_APP_CHECK,
}, async (request) => {
    if (!request.auth?.uid) {
        (0, logger_1.warn)('Unauthenticated channel OAuth attempt');
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const userId = request.auth.uid;
    (0, rate_limit_1.assertRateLimit)({
        key: `oauth:${userId}`,
        ...rate_limit_1.RATE_LIMIT_PRESETS.oauth,
    });
    const channel = request.data?.channel;
    if (!channel || !META_CHANNELS.has(channel)) {
        throw new https_1.HttpsError('invalid-argument', 'Canal inválido.');
    }
    const state = (0, utils_1.buildOAuthState)(userId, channel, config_1.metaAppSecret.value());
    const redirectUri = `${(0, config_1.getFunctionsBaseUrl)()}/oauthCallback`;
    const deepLinkScheme = config_1.appDeepLinkScheme.value();
    await (0, utils_1.saveChannelConnection)(userId, channel, { status: 'pending' });
    (0, logger_1.audit)({ action: 'channel_oauth_started', userId, meta: { channel } });
    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    authUrl.searchParams.set('client_id', config_1.metaAppId.value());
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', config_1.META_SCOPES[channel].join(','));
    authUrl.searchParams.set('response_type', 'code');
    return {
        authUrl: authUrl.toString(),
        redirectUri: `${deepLinkScheme}://integrations`,
    };
});
exports.getChannelConnections = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
        (0, logger_1.warn)('Unauthenticated channel connections read attempt');
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const snapshot = await utils_1.db
        .collection('channel_connections')
        .doc(request.auth.uid)
        .collection('channels')
        .get();
    const connections = {
        whatsapp: { channel: 'whatsapp', status: 'disconnected' },
        instagram: { channel: 'instagram', status: 'disconnected' },
        facebook: { channel: 'facebook', status: 'disconnected' },
    };
    for (const document of snapshot.docs) {
        if (META_CHANNELS.has(document.id)) {
            connections[document.id] = document.data();
        }
    }
    return { connections };
});
exports.disconnectChannel = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
        (0, logger_1.warn)('Unauthenticated channel disconnect attempt');
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const channel = request.data?.channel;
    if (!channel || !META_CHANNELS.has(channel)) {
        throw new https_1.HttpsError('invalid-argument', 'Canal inválido.');
    }
    const userId = request.auth.uid;
    await (0, utils_1.saveChannelConnection)(userId, channel, {
        status: 'disconnected',
        externalAccountId: null,
        externalAccountName: null,
        pageId: null,
        phoneNumberId: null,
        instagramAccountId: null,
        wabaId: null,
        errorMessage: null,
    });
    await utils_1.db
        .collection('integration_secrets')
        .doc(userId)
        .collection('channels')
        .doc(channel)
        .delete();
    return { success: true };
});
//# sourceMappingURL=channel-oauth.js.map