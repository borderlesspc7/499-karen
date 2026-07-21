"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectChannel = exports.getChannelConnections = exports.startChannelOAuth = void 0;
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("./config");
const utils_1 = require("./utils");
const META_CHANNELS = new Set(['whatsapp', 'instagram', 'facebook']);
exports.startChannelOAuth = (0, https_1.onCall)({
    secrets: [config_1.metaAppSecret],
    cors: true,
}, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const channel = request.data?.channel;
    if (!channel || !['whatsapp', 'instagram', 'facebook', 'linkedin'].includes(channel)) {
        throw new https_1.HttpsError('invalid-argument', 'Canal inválido.');
    }
    const userId = request.auth.uid;
    const state = (0, utils_1.buildOAuthState)(userId, channel, config_1.metaAppSecret.value());
    const redirectUri = `${(0, config_1.getFunctionsBaseUrl)()}/oauthCallback`;
    const deepLinkScheme = config_1.appDeepLinkScheme.value();
    await (0, utils_1.saveChannelConnection)(userId, channel, { status: 'pending' });
    if (META_CHANNELS.has(channel)) {
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
    }
    const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedinAuthUrl.searchParams.set('response_type', 'code');
    linkedinAuthUrl.searchParams.set('client_id', config_1.linkedinClientId.value());
    linkedinAuthUrl.searchParams.set('redirect_uri', redirectUri);
    linkedinAuthUrl.searchParams.set('state', state);
    linkedinAuthUrl.searchParams.set('scope', config_1.LINKEDIN_SCOPES.join(' '));
    return {
        authUrl: linkedinAuthUrl.toString(),
        redirectUri: `${deepLinkScheme}://integrations`,
    };
});
exports.getChannelConnections = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
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
        linkedin: { channel: 'linkedin', status: 'disconnected' },
    };
    for (const document of snapshot.docs) {
        connections[document.id] = document.data();
    }
    return { connections };
});
exports.disconnectChannel = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }
    const channel = request.data?.channel;
    if (!channel) {
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