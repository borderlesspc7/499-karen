import {
  linkedinClientId,
  metaAppId,
  META_GRAPH_BASE,
} from './config'
import {
  saveChannelConnection,
  saveChannelSecret,
  type MessagingChannel,
} from './utils'

export async function exchangeMetaCode(
  code: string,
  redirectUri: string,
  appSecret: string,
): Promise<string> {
  const tokenUrl = new URL(`${META_GRAPH_BASE}/oauth/access_token`)
  tokenUrl.searchParams.set('client_id', metaAppId.value())
  tokenUrl.searchParams.set('client_secret', appSecret)
  tokenUrl.searchParams.set('redirect_uri', redirectUri)
  tokenUrl.searchParams.set('code', code)

  const tokenResponse = await fetch(tokenUrl.toString())
  const payload = (await tokenResponse.json()) as { access_token?: string; error?: { message: string } }

  if (!tokenResponse.ok || !payload.access_token) {
    throw new Error(payload.error?.message ?? 'Falha ao obter token Meta.')
  }

  return payload.access_token
}

export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string,
  clientSecret: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: linkedinClientId.value(),
    client_secret: clientSecret,
  })

  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const payload = (await tokenResponse.json()) as {
    access_token?: string
    error_description?: string
  }

  if (!tokenResponse.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? 'Falha ao obter token LinkedIn.')
  }

  return payload.access_token
}

async function subscribePageToWebhook(pageId: string, pageAccessToken: string): Promise<void> {
  await fetch(`${META_GRAPH_BASE}/${pageId}/subscribed_apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscribed_fields: ['messages', 'messaging_postbacks', 'message_echoes'],
      access_token: pageAccessToken,
    }),
  })
}

export async function connectMetaChannel(
  userId: string,
  channel: MessagingChannel,
  userAccessToken: string,
): Promise<void> {
  const pagesResponse = await fetch(
    `${META_GRAPH_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`,
  )
  const pagesPayload = (await pagesResponse.json()) as {
    data?: Array<{
      id: string
      name: string
      access_token: string
      instagram_business_account?: { id: string }
    }>
    error?: { message: string }
  }

  if (!pagesResponse.ok) {
    throw new Error(pagesPayload.error?.message ?? 'Falha ao listar páginas Meta.')
  }

  const page = pagesPayload.data?.[0]
  if (!page) {
    throw new Error('Nenhuma página Facebook encontrada. Vincule uma página ao seu app Meta.')
  }

  if (channel === 'whatsapp') {
    const wabaResponse = await fetch(
      `${META_GRAPH_BASE}/${page.id}/?fields=whatsapp_business_account&access_token=${page.access_token}`,
    )
    const wabaPayload = (await wabaResponse.json()) as {
      whatsapp_business_account?: { id: string }
      error?: { message: string }
    }

    const wabaId = wabaPayload.whatsapp_business_account?.id
    if (!wabaId) {
      throw new Error('Conta WhatsApp Business não vinculada à página Facebook.')
    }

    const phonesResponse = await fetch(
      `${META_GRAPH_BASE}/${wabaId}/phone_numbers?access_token=${page.access_token}`,
    )
    const phonesPayload = (await phonesResponse.json()) as {
      data?: Array<{ id: string; display_phone_number?: string }>
      error?: { message: string }
    }

    const phone = phonesPayload.data?.[0]
    if (!phone) {
      throw new Error('Nenhum número WhatsApp Business encontrado.')
    }

    await saveChannelSecret(userId, 'whatsapp', {
      accessToken: userAccessToken,
      pageAccessToken: page.access_token,
      pageId: page.id,
      phoneNumberId: phone.id,
      wabaId,
    })

    await saveChannelConnection(userId, 'whatsapp', {
      status: 'connected',
      externalAccountId: phone.id,
      externalAccountName: phone.display_phone_number ?? 'WhatsApp Business',
      pageId: page.id,
      phoneNumberId: phone.id,
      wabaId,
      connectedAt: new Date().toISOString(),
    })

    await subscribePageToWebhook(page.id, page.access_token)
    return
  }

  if (channel === 'instagram') {
    const instagramAccountId = page.instagram_business_account?.id
    if (!instagramAccountId) {
      throw new Error('Conta Instagram Business não vinculada à página Facebook.')
    }

    await saveChannelSecret(userId, 'instagram', {
      accessToken: userAccessToken,
      pageAccessToken: page.access_token,
      pageId: page.id,
      instagramAccountId,
    })

    await saveChannelConnection(userId, 'instagram', {
      status: 'connected',
      externalAccountId: instagramAccountId,
      externalAccountName: page.name,
      pageId: page.id,
      instagramAccountId,
      connectedAt: new Date().toISOString(),
    })

    await subscribePageToWebhook(page.id, page.access_token)
    return
  }

  await saveChannelSecret(userId, 'facebook', {
    accessToken: userAccessToken,
    pageAccessToken: page.access_token,
    pageId: page.id,
  })

  await saveChannelConnection(userId, 'facebook', {
    status: 'connected',
    externalAccountId: page.id,
    externalAccountName: page.name,
    pageId: page.id,
    connectedAt: new Date().toISOString(),
  })

  await subscribePageToWebhook(page.id, page.access_token)
}

export async function connectLinkedInChannel(userId: string, accessToken: string): Promise<void> {
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const profile = (await profileResponse.json()) as {
    sub?: string
    name?: string
    email?: string
  }

  if (!profileResponse.ok || !profile.sub) {
    throw new Error('Falha ao obter perfil LinkedIn.')
  }

  await saveChannelSecret(userId, 'linkedin', {
    accessToken,
    linkedinMemberId: profile.sub,
  })

  await saveChannelConnection(userId, 'linkedin', {
    status: 'connected',
    externalAccountId: profile.sub,
    externalAccountName: profile.name ?? profile.email ?? 'LinkedIn',
    connectedAt: new Date().toISOString(),
  })
}
