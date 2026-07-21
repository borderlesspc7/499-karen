import { defineString, defineSecret } from 'firebase-functions/params'

export const metaAppId = defineString('META_APP_ID')
export const metaAppSecret = defineSecret('META_APP_SECRET')
export const metaWebhookVerifyToken = defineSecret('META_WEBHOOK_VERIFY_TOKEN')
export const linkedinClientId = defineString('LINKEDIN_CLIENT_ID')
export const linkedinClientSecret = defineSecret('LINKEDIN_CLIENT_SECRET')
export const appDeepLinkScheme = defineString('APP_DEEP_LINK_SCHEME', {
  default: 'summus-edge',
})

export function getFunctionsBaseUrl(): string {
  const projectId = process.env.GCLOUD_PROJECT ?? process.env.GCP_PROJECT ?? 'karen-eaaf4'
  const region = process.env.FUNCTION_REGION ?? 'us-central1'
  return `https://${region}-${projectId}.cloudfunctions.net`
}

export const META_GRAPH_API_VERSION = 'v21.0'
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`

export const META_SCOPES: Record<string, string[]> = {
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
}

export const LINKEDIN_SCOPES = ['openid', 'profile', 'email', 'w_member_social']
