# Matriz de credenciais e chaves — Summus Edge

Documento de evidência para o checklist de produção.  
Última atualização: 2026-07-30.

## Regra fundamental

| Tipo | Pode ir no app? | Pode ir no repositório Git? |
|------|-----------------|-----------------------------|
| Firebase Client SDK (`apiKey`, `appId`, etc.) | Sim (pública por design) | Preferível via env/EAS; defaults de staging ok |
| OAuth Client IDs de login social | Sim | Preferível via env/EAS |
| Secrets (App Secret, Stripe secret, OpenAI, webhook tokens) | **Nunca** | **Nunca** |
| Service Account / Admin SDK | **Nunca** | **Nunca** (só runtime GCP) |

A proteção dos dados **não** depende de ocultar a API key do Firebase Client. Depende de:

1. Firebase Authentication  
2. Firestore / Storage Security Rules  
3. Secrets apenas nas Cloud Functions  
4. App Check (hardening de produção)

---

## Legenda das colunas (pedido da cliente)

| Coluna | Significado |
|--------|-------------|
| **a) Dev** | Necessária para desenvolvimento / staging |
| **b) Prod** | Necessária para produção |
| **c) App** | Embarcada no aplicativo (Expo / EAS) |
| **d) Backend** | Exclusiva do backend (Cloud Functions / GCP) |
| **e) Cliente** | Precisa ser fornecida / criada na conta da cliente |
| **f) Borderless** | Gerada ou configurada pela Borderless |

Valores nas células: `Sim` | `Não` | `Nunca` | `Opcional` | `Ideal` | `—`

---

## 1. Firebase (Auth, Firestore, Storage, Functions)

| Credencial / item | a) Dev | b) Prod | c) App | d) Backend | e) Cliente | f) Borderless | Observação |
|-------------------|--------|---------|--------|------------|------------|---------------|------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Sim | Sim | Sim | — | Ideal* | Sim* | Pública; proteção = Rules + Auth |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sim | Sim | Sim | — | Ideal* | Sim* | |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Sim | Sim | Sim | — | Ideal* | Sim* | Dev e prod devem ser projetos **separados** |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sim | Sim | Sim | — | Ideal* | Sim* | |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sim | Sim | Sim | — | Ideal* | Sim* | |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Sim | Sim | Sim | — | Ideal* | Sim* | |
| `EXPO_PUBLIC_FIREBASE_APP_CHECK=1` | Opcional | Sim (Web) | Sim | — | — | Sim | Ativa o bootstrap App Check no cliente Web |
| `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` | Opcional | Sim (Web) | Sim | — | Ideal* | Sim* | Chave pública ReCAPTCHA v3 cadastrada no App Check |
| Service Account / Admin credentials | — | — | **Nunca** | Sim | Conta GCP/Firebase dela* | Provisionada pelo GCP | **Nunca** enviada por e-mail/chat; ADC no runtime |

\*Se a infraestrutura Firebase/GCP for da cliente, ela cria o projeto (ou recebe transferência) e a Borderless configura. Se ainda estiver na Borderless, geramos e transferimos na entrega.

**Como configurar no app**

```bash
# mobile/.env (local) — ver mobile/.env.example
# EAS Build:
eas env:push --environment preview --path .env
eas env:push --environment production --path .env
```

---

## 2. Login social (Client IDs — ficam no app)

| Credencial / item | a) Dev | b) Prod | c) App | d) Backend | e) Cliente | f) Borderless | Observação |
|-------------------|--------|---------|--------|------------|------------|---------------|------------|
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Sim | Sim | Sim | — | Ideal | Sim* | OAuth Google (web) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Sim (iOS) | Sim | Sim | — | Ideal | Sim* | |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Sim (Android) | Sim | Sim | — | Ideal | Sim* | |
| `EXPO_PUBLIC_FACEBOOK_APP_ID` | Opcional | Se FB login | Sim | — | Ideal | Sim* | Login com Facebook |
| `EXPO_PUBLIC_MICROSOFT_CLIENT_ID` | Opcional | Se MS login | Sim | — | Ideal | Sim* | Azure AD / Entra |
| Apple Sign In | iOS | iOS | Sem secret* | Config no Firebase Auth | **Apple Developer** (prod) | Config técnica | Identity Token; provedor no Firebase Console |

\*Não há “client secret” da Apple no aplicativo. Em produção é obrigatória conta Apple Developer da cliente (ou transferida).

Variáveis lidas em `mobile/app.config.ts` → `extra.oauth`.

---

## 3. Integrações omnichannel (Meta)

| Credencial / item | a) Dev | b) Prod | c) App | d) Backend | e) Cliente | f) Borderless | Observação |
|-------------------|--------|---------|--------|------------|------------|---------------|------------|
| `META_APP_ID` | Sim | Sim | **Não** | Sim (param) | **Sim** | Opcional* | App Business no Meta for Developers |
| `META_APP_SECRET` | Sim | Sim | **Nunca** | Sim (secret) | **Sim** | Opcional* | Secret do app Meta |
| `META_WEBHOOK_VERIFY_TOKEN` | Sim | Sim | **Nunca** | Sim (secret) | Opcional | **Sim** | Borderless gera e configura no webhook |
| Tokens OAuth por usuário (page/WABA) | — | — | **Nunca** | Sim (`integration_secrets`) | Gerados no OAuth do usuário final | Armazenados no backend | Inacessíveis ao cliente via Security Rules |

\*Podemos criar em conta temporária da Borderless e transferir; o ideal é app já na conta da cliente.

### URLs a cadastrar nos painéis (não são chaves)

| Uso | URL |
|-----|-----|
| OAuth callback | `https://us-central1-<PROJECT_ID>.cloudfunctions.net/oauthCallback` |
| Webhook Meta | `https://us-central1-<PROJECT_ID>.cloudfunctions.net/metaWebhook` |

Verify token do webhook Meta = mesmo valor de `META_WEBHOOK_VERIFY_TOKEN`.  
Campos sugeridos: `messages`, `messaging_postbacks`, `message_echoes`.

Detalhes: `mobile/CHANNEL_INTEGRATIONS.md`.

### Como configurar no backend

```bash
cd mobile

firebase functions:secrets:set META_APP_SECRET
firebase functions:secrets:set META_WEBHOOK_VERIFY_TOKEN

# Params (não-secret)
# META_APP_ID via Firebase params / .env das Functions
```

---

## 4. Inteligência artificial (OpenAI)

| Credencial / item | a) Dev | b) Prod | c) App | d) Backend | e) Cliente | f) Borderless | Observação |
|-------------------|--------|---------|--------|------------|------------|---------------|------------|
| `OPENAI_API_KEY` | Sim | Sim | **Nunca** | Sim (secret) | **Sim** (recomendado) | Só demo | Features: campanhas, insights, smart replies |

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

---

## 5. Pagamentos (Stripe)

| Credencial / item | a) Dev | b) Prod | c) App | d) Backend | e) Cliente | f) Borderless | Observação |
|-------------------|--------|---------|--------|------------|------------|---------------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` | **Nunca** | Sim (secret) | **Sim** | — | Sem key = modo **mock** (demo) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` test | `whsec_…` live | **Nunca** | Sim (secret) | Gerado no Stripe dela | Configura endpoint | |
| Stripe Price IDs (`price_…`) | test | live | Não | Sim (catálogo) | Criados na conta Stripe dela | Mapeados no código | |
| `EXPO_PUBLIC_STRIPE_MOCK_LOCAL` | Opcional | **Não** | Flag | — | — | Flag de dev | Só desenvolvimento |

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Webhook Stripe → Cloud Function `stripeWebhook` (assinatura validada com `STRIPE_WEBHOOK_SECRET`).

---

## 6. Flags somente desenvolvimento

| Item | a) Dev | b) Prod | c) App | d) Backend | e) Cliente | f) Borderless |
|------|--------|---------|--------|------------|------------|---------------|
| `EXPO_PUBLIC_FUNCTIONS_EMULATOR=1` | Sim | **Não** | Sim | — | — | Sim |
| `EXPO_PUBLIC_STRIPE_MOCK_LOCAL=1` | Opcional | **Não** | Sim | — | — | Sim |

---

## Resumo: o que a cliente precisa enviar

### Desenvolvimento / staging

| # | Item | Formato / onde criar |
|---|------|----------------------|
| 1 | Acesso ao Firebase/GCP de staging **ou** aceite do projeto de staging da Borderless | Console Google Cloud / Firebase |
| 2 | Meta App (modo desenvolvimento) — App ID + App Secret | [developers.facebook.com](https://developers.facebook.com/) |
| 3 | OpenAI API Key (projeto/billing de teste) | platform.openai.com |
| 4 | Stripe `sk_test_…` *(ou manter mock até a key chegar)* | dashboard.stripe.com (test mode) |
| 5 | Client IDs de login social *(se forem testar social em device/build)* | Google Cloud / Meta / Azure / Apple |

### Produção (go-live)

| # | Item | Formato / onde criar |
|---|------|----------------------|
| 1 | **Propriedade** da conta Google Cloud / Firebase de produção | Transferência ou projeto criado por vocês |
| 2 | `META_APP_ID` + `META_APP_SECRET` (app Business de produção) + Página / WABA / Instagram vinculados | Meta for Developers |
| 3 | `OPENAI_API_KEY` com billing de produção | OpenAI |
| 4 | `STRIPE_SECRET_KEY` (`sk_live_…`) + acesso para Products/Prices e webhook | Stripe |
| 5 | Login social de produção: Google Client IDs, Facebook App ID, Microsoft Client ID, Apple Developer | Respectivos consoles |

**Canal seguro de envio:** gerenciador de secrets / vault / compartilhamento criptografado — **não** e-mail em texto puro.

---

## Resumo: o que a Borderless gera / configura

| # | Item |
|---|------|
| 1 | `META_WEBHOOK_VERIFY_TOKEN` |
| 2 | URLs de OAuth callback e webhook Meta |
| 3 | Injeção dos secrets nas Cloud Functions (`firebase functions:secrets:set`) |
| 4 | Variáveis `EXPO_PUBLIC_*` no EAS (preview / production) |
| 5 | Service Account implícita do GCP (nunca compartilhada fora do runtime) |
| 6 | Mapeamento dos Stripe Price IDs no catálogo do backend |
| 7 | Documentação de ambientes, rotação e este documento |
| 8 | Em demo atual: Firebase client de desenvolvimento + Stripe mock (sem `STRIPE_SECRET_KEY`) |

---

## Checklist de evidência (status)

| Área | Status atual | Evidência / próximo passo |
|------|--------------|---------------------------|
| Secrets no backend (`defineSecret`) | Implementado | `mobile/functions/src/config.ts`, `ai-orchestration.ts`, `stripe-billing.ts` |
| Secrets fora do app / Git | Implementado | `.gitignore` ignora `.env` e `serviceAccountKey.json` |
| Firebase client no app | Implementado | `mobile/.env.example`, `mobile/lib/env.ts`, `mobile/app.config.ts` |
| Tokens OAuth inacessíveis ao cliente | Implementado | `integration_secrets` → `allow read, write: if false` em `firestore.rules` |
| Matriz documentada (a–f) | Este documento | Entregar à cliente |
| Projetos Firebase Dev ≠ Prod | **Pendente (ops)** | Estado atual: `karen-eaaf4` único — ver `docs/environments.md` (migração) |
| Stripe live (não mock) | Pendente (aguarda keys) | Cliente envia `sk_live_` + webhook |
| App Check | Parcial (opt-in Web) | Bootstrap implementado; enforcement desligado até validar todos os clientes |
| Hardening produção (visão geral) | Documentado | `docs/production-hardening-checklist.md` |
| Backup / PITR / export GCS | **Pendente (ops)** | Runbook: `docs/backup-and-recovery.md` |
| QA aceite (cross-user, auth, paginação) | Documentado | `docs/qa-acceptance-checklist.md` |
| Modelo de reads Firestore | Documentado | `docs/firestore-read-costs.md` |

### App Check e staging — cobertura dos docs

| Item | Status | Onde está documentado |
|------|--------|------------------------|
| Separação dev / staging / prod | Pendente (ops) | `docs/environments.md`, § Projetos Firebase Dev ≠ Prod (acima) |
| EAS env por ambiente | Parcial (perfis ok; 1 projeto Firebase) | `docs/environments.md`, `mobile/eas.json` |
| App Check no client | Implementado (opt-in Web) | Definir `EXPO_PUBLIC_FIREBASE_APP_CHECK=1` e `EXPO_PUBLIC_RECAPTCHA_SITE_KEY`; nativo requer provider próprio |
| App Check nas Functions | Preparado, não aplicado | `ENFORCE_APP_CHECK=false` evita quebrar clientes sem token; ativar após rollout |
| Credenciais por ambiente (a–f) | Documentado | Este documento + `docs/environments.md` |

---

## Referências no repositório

| Arquivo | Conteúdo |
|---------|----------|
| `mobile/.env.example` | Template das variáveis do app |
| `mobile/CHANNEL_INTEGRATIONS.md` | Meta / webhooks / deploy |
| `mobile/BUILD_APK.md` | EAS env + build APK |
| `mobile/functions/src/config.ts` | Params e secrets Meta |
| `mobile/functions/src/ai-orchestration.ts` | `OPENAI_API_KEY` |
| `mobile/functions/src/stripe-billing.ts` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `mobile/firestore.rules` | Bloqueio de secrets e billing no cliente |
| `docs/production-hardening-checklist.md` | Checklist de hardening por área |
| `docs/backup-and-recovery.md` | PITR, export GCS, RPO/RTO |
| `docs/environments.md` | Dev / staging / prod, `.firebaserc`, EAS |
| `docs/qa-acceptance-checklist.md` | Testes de aceite QA |
| `docs/firestore-read-costs.md` | Leituras esperadas Firestore |
