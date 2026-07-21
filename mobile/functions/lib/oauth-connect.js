"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeMetaCode = exchangeMetaCode;
exports.exchangeLinkedInCode = exchangeLinkedInCode;
exports.connectMetaChannel = connectMetaChannel;
exports.connectLinkedInChannel = connectLinkedInChannel;
const config_1 = require("./config");
const utils_1 = require("./utils");
async function exchangeMetaCode(code, redirectUri, appSecret) {
    const tokenUrl = new URL(`${config_1.META_GRAPH_BASE}/oauth/access_token`);
    tokenUrl.searchParams.set('client_id', config_1.metaAppId.value());
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);
    const tokenResponse = await fetch(tokenUrl.toString());
    const payload = (await tokenResponse.json());
    if (!tokenResponse.ok || !payload.access_token) {
        throw new Error(payload.error?.message ?? 'Falha ao obter token Meta.');
    }
    return payload.access_token;
}
async function exchangeLinkedInCode(code, redirectUri, clientSecret) {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config_1.linkedinClientId.value(),
        client_secret: clientSecret,
    });
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });
    const payload = (await tokenResponse.json());
    if (!tokenResponse.ok || !payload.access_token) {
        throw new Error(payload.error_description ?? 'Falha ao obter token LinkedIn.');
    }
    return payload.access_token;
}
async function subscribePageToWebhook(pageId, pageAccessToken) {
    await fetch(`${config_1.META_GRAPH_BASE}/${pageId}/subscribed_apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subscribed_fields: ['messages', 'messaging_postbacks', 'message_echoes'],
            access_token: pageAccessToken,
        }),
    });
}
async function connectMetaChannel(userId, channel, userAccessToken) {
    const pagesResponse = await fetch(`${config_1.META_GRAPH_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`);
    const pagesPayload = (await pagesResponse.json());
    if (!pagesResponse.ok) {
        throw new Error(pagesPayload.error?.message ?? 'Falha ao listar páginas Meta.');
    }
    const page = pagesPayload.data?.[0];
    if (!page) {
        throw new Error('Nenhuma página Facebook encontrada. Vincule uma página ao seu app Meta.');
    }
    if (channel === 'whatsapp') {
        const wabaResponse = await fetch(`${config_1.META_GRAPH_BASE}/${page.id}/?fields=whatsapp_business_account&access_token=${page.access_token}`);
        const wabaPayload = (await wabaResponse.json());
        const wabaId = wabaPayload.whatsapp_business_account?.id;
        if (!wabaId) {
            throw new Error('Conta WhatsApp Business não vinculada à página Facebook.');
        }
        const phonesResponse = await fetch(`${config_1.META_GRAPH_BASE}/${wabaId}/phone_numbers?access_token=${page.access_token}`);
        const phonesPayload = (await phonesResponse.json());
        const phone = phonesPayload.data?.[0];
        if (!phone) {
            throw new Error('Nenhum número WhatsApp Business encontrado.');
        }
        await (0, utils_1.saveChannelSecret)(userId, 'whatsapp', {
            accessToken: userAccessToken,
            pageAccessToken: page.access_token,
            pageId: page.id,
            phoneNumberId: phone.id,
            wabaId,
        });
        await (0, utils_1.saveChannelConnection)(userId, 'whatsapp', {
            status: 'connected',
            externalAccountId: phone.id,
            externalAccountName: phone.display_phone_number ?? 'WhatsApp Business',
            pageId: page.id,
            phoneNumberId: phone.id,
            wabaId,
            connectedAt: new Date().toISOString(),
        });
        await subscribePageToWebhook(page.id, page.access_token);
        return;
    }
    if (channel === 'instagram') {
        const instagramAccountId = page.instagram_business_account?.id;
        if (!instagramAccountId) {
            throw new Error('Conta Instagram Business não vinculada à página Facebook.');
        }
        await (0, utils_1.saveChannelSecret)(userId, 'instagram', {
            accessToken: userAccessToken,
            pageAccessToken: page.access_token,
            pageId: page.id,
            instagramAccountId,
        });
        await (0, utils_1.saveChannelConnection)(userId, 'instagram', {
            status: 'connected',
            externalAccountId: instagramAccountId,
            externalAccountName: page.name,
            pageId: page.id,
            instagramAccountId,
            connectedAt: new Date().toISOString(),
        });
        await subscribePageToWebhook(page.id, page.access_token);
        return;
    }
    await (0, utils_1.saveChannelSecret)(userId, 'facebook', {
        accessToken: userAccessToken,
        pageAccessToken: page.access_token,
        pageId: page.id,
    });
    await (0, utils_1.saveChannelConnection)(userId, 'facebook', {
        status: 'connected',
        externalAccountId: page.id,
        externalAccountName: page.name,
        pageId: page.id,
        connectedAt: new Date().toISOString(),
    });
    await subscribePageToWebhook(page.id, page.access_token);
}
async function connectLinkedInChannel(userId, accessToken) {
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = (await profileResponse.json());
    if (!profileResponse.ok || !profile.sub) {
        throw new Error('Falha ao obter perfil LinkedIn.');
    }
    await (0, utils_1.saveChannelSecret)(userId, 'linkedin', {
        accessToken,
        linkedinMemberId: profile.sub,
    });
    await (0, utils_1.saveChannelConnection)(userId, 'linkedin', {
        status: 'connected',
        externalAccountId: profile.sub,
        externalAccountName: profile.name ?? profile.email ?? 'LinkedIn',
        connectedAt: new Date().toISOString(),
    });
}
//# sourceMappingURL=oauth-connect.js.map