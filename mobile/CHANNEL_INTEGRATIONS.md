# Integrações Omnichannel — WhatsApp, Instagram, Facebook, LinkedIn

O Inbox agrega conversas reais das redes conectadas. O usuário responde pelo app; o envio/recebimento passa pelas Cloud Functions.

## Arquitetura

```
Redes (Meta / LinkedIn)
        ↓ webhook / OAuth
Cloud Functions (mobile/functions)
        ↓ Admin SDK
Firestore (conversations + messages)
        ↓ onSnapshot
App Expo (Inbox)
```

Tokens OAuth ficam em `integration_secrets/{userId}` — **inacessível pelo cliente**.

Status das conexões em `channel_connections/{userId}/channels/{canal}` — **leitura pelo app**.

## Deploy

```bash
cd mobile/functions && npm install && npm run build
cd mobile

# Secrets (uma vez)
firebase functions:secrets:set META_APP_SECRET
firebase functions:secrets:set META_WEBHOOK_VERIFY_TOKEN
firebase functions:secrets:set LINKEDIN_CLIENT_SECRET

# Params
firebase functions:config:set \
  meta.app_id="SEU_META_APP_ID" \
  linkedin.client_id="SEU_LINKEDIN_CLIENT_ID"

firebase deploy --only functions,firestore:rules,firestore:indexes
```

## Meta (WhatsApp + Instagram + Facebook)

1. [Meta for Developers](https://developers.facebook.com/) → criar app Business
2. Produtos: **WhatsApp**, **Instagram Graph API**, **Messenger**
3. Vincular Página Facebook + Instagram Business + WhatsApp Business Account
4. OAuth Redirect URI:
   `https://us-central1-karen-eaaf4.cloudfunctions.net/oauthCallback`
5. Webhook URL:
   `https://us-central1-karen-eaaf4.cloudfunctions.net/metaWebhook`
   - Verify token = valor de `META_WEBHOOK_VERIFY_TOKEN`
   - Assinar: `messages`, `messaging_postbacks`, `message_echoes`

### Permissões OAuth por canal

| Canal | Scopes |
|-------|--------|
| WhatsApp | whatsapp_business_management, whatsapp_business_messaging, business_management |
| Instagram | instagram_manage_messages, instagram_basic, pages_messaging, … |
| Facebook | pages_messaging, pages_manage_metadata, pages_read_engagement, … |

## LinkedIn

- OAuth conecta a conta (publicação/perfil)
- **Inbox LinkedIn**: a API pública de mensagens DM não está disponível para apps terceiros genéricos — requer parceria LinkedIn. O app conecta a conta; envio de DM pelo inbox retorna erro explicativo até integração de parceiro.

## Fluxo no app

1. **Integrações** → toggle → OAuth no browser → retorno via `summus-edge://integrations`
2. **Inbox** → conversas em tempo real via Firestore listener
3. **Enviar mensagem** → Cloud Function `sendInboxMessage` → Graph API Meta

## Emulador local

```bash
cd mobile && firebase emulators:start --only functions,firestore
# No .env: EXPO_PUBLIC_FUNCTIONS_EMULATOR=1
```
