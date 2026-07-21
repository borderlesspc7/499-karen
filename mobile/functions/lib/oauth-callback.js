"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallback = void 0;
const https_1 = require("firebase-functions/v2/https");
const config_1 = require("./config");
const oauth_connect_1 = require("./oauth-connect");
const utils_1 = require("./utils");
exports.oauthCallback = (0, https_1.onRequest)({
    secrets: [config_1.metaAppSecret, config_1.linkedinClientSecret],
    cors: true,
}, async (request, response) => {
    const code = request.query.code;
    const state = request.query.state;
    const error = request.query.error;
    const deepLinkScheme = config_1.appDeepLinkScheme.value();
    const redirectUri = `${(0, config_1.getFunctionsBaseUrl)()}/oauthCallback`;
    if (error || !code || !state) {
        response.redirect(`${deepLinkScheme}://integrations?status=error&message=${error ?? 'oauth_failed'}`);
        return;
    }
    const parsed = (0, utils_1.parseOAuthState)(state, config_1.metaAppSecret.value());
    if (!parsed) {
        response.redirect(`${deepLinkScheme}://integrations?status=error&message=invalid_state`);
        return;
    }
    try {
        if (parsed.channel === 'linkedin') {
            const accessToken = await (0, oauth_connect_1.exchangeLinkedInCode)(code, redirectUri, config_1.linkedinClientSecret.value());
            await (0, oauth_connect_1.connectLinkedInChannel)(parsed.userId, accessToken);
        }
        else {
            const accessToken = await (0, oauth_connect_1.exchangeMetaCode)(code, redirectUri, config_1.metaAppSecret.value());
            await (0, oauth_connect_1.connectMetaChannel)(parsed.userId, parsed.channel, accessToken);
        }
        response.redirect(`${deepLinkScheme}://integrations?status=connected&channel=${parsed.channel}`);
    }
    catch (connectError) {
        const message = connectError instanceof Error ? connectError.message : 'connection_failed';
        await (0, utils_1.saveChannelConnection)(parsed.userId, parsed.channel, {
            status: 'error',
            errorMessage: message,
        });
        response.redirect(`${deepLinkScheme}://integrations?status=error&channel=${parsed.channel}&message=${encodeURIComponent(message)}`);
    }
});
//# sourceMappingURL=oauth-callback.js.map