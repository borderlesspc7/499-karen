"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINKEDIN_SCOPES = exports.META_SCOPES = exports.META_GRAPH_BASE = exports.META_GRAPH_API_VERSION = exports.appDeepLinkScheme = exports.linkedinClientSecret = exports.linkedinClientId = exports.metaWebhookVerifyToken = exports.metaAppSecret = exports.metaAppId = void 0;
exports.getFunctionsBaseUrl = getFunctionsBaseUrl;
const params_1 = require("firebase-functions/params");
exports.metaAppId = (0, params_1.defineString)('META_APP_ID');
exports.metaAppSecret = (0, params_1.defineSecret)('META_APP_SECRET');
exports.metaWebhookVerifyToken = (0, params_1.defineSecret)('META_WEBHOOK_VERIFY_TOKEN');
exports.linkedinClientId = (0, params_1.defineString)('LINKEDIN_CLIENT_ID');
exports.linkedinClientSecret = (0, params_1.defineSecret)('LINKEDIN_CLIENT_SECRET');
exports.appDeepLinkScheme = (0, params_1.defineString)('APP_DEEP_LINK_SCHEME', {
    default: 'summus-edge',
});
function getFunctionsBaseUrl() {
    const projectId = process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? 'karen-eaaf4';
    const region = process.env.FUNCTION_REGION ?? 'us-central1';
    return `https://${region}-${projectId}.cloudfunctions.net`;
}
exports.META_GRAPH_API_VERSION = 'v21.0';
exports.META_GRAPH_BASE = `https://graph.facebook.com/${exports.META_GRAPH_API_VERSION}`;
exports.META_SCOPES = {
    whatsapp: [
        'whatsapp_business_management',
        'whatsapp_business_messaging',
        'business_management',
    ],
    instagram: [
        'instagram_manage_messages',
        'instagram_basic',
        'pages_manage_metadata',
        'pages_messaging',
        'pages_read_engagement',
        'business_management',
    ],
    facebook: [
        'pages_messaging',
        'pages_manage_metadata',
        'pages_read_engagement',
        'business_management',
    ],
};
exports.LINKEDIN_SCOPES = ['openid', 'profile', 'email', 'w_member_social'];
//# sourceMappingURL=config.js.map