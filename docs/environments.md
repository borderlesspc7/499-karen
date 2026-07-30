# Ambientes — Dev, Staging e Produção

Separação de projetos Firebase, credenciais e builds EAS para o Summus Edge.

Última atualização: 2026-07-30.

---

## Princípios

1. **Projetos Firebase distintos** por ambiente (dados isolados).
2. **Variáveis `EXPO_PUBLIC_*`** injetadas por perfil EAS — nunca hardcode de prod em dev.
3. **Secrets** (`defineSecret`) configurados **por projeto** Firebase (`firebase use <alias>`).
4. **Nunca** testar fluxos destrutivos em produção: delete em massa, restore, Stripe live, webhooks reais sem sandbox, carga abusiva.

---

## Estado atual

| Item | Valor |
|------|-------|
| Projeto Firebase único | `karen-eaaf4` |
| Alias `.firebaserc` | apenas `default` → `karen-eaaf4` |
| EAS | perfis `development`, `preview`, `preview-testflight`, `production` |
| Stripe | mock/demo sem `STRIPE_SECRET_KEY` live |

**Conclusão:** ambiente de demo/staging compartilhado; **produção dedicada pendente** (ver migração abaixo).

---

## Mapeamento alvo

| Ambiente | Firebase project | EAS build profile | EAS env | Uso |
|----------|------------------|-------------------|---------|-----|
| **Dev** | `summus-dev` (ex.) | `development` | `development` | Emuladores, dev client, dados fictícios |
| **Staging** | `summus-staging` (ex.) | `preview`, `preview-testflight` | `preview` | QA, APK interno, Meta app em modo dev |
| **Produção** | `summus-prod` (conta cliente) | `production` | `production` | App stores, Stripe live, Meta prod |

Nomes são exemplos — definir com a cliente na transferência GCP.

---

## `.firebaserc` — adicionar projetos

Arquivo: `mobile/.firebaserc`

```json
{
  "projects": {
    "default": "summus-dev",
    "dev": "summus-dev",
    "staging": "summus-staging",
    "prod": "summus-prod"
  }
}
```

Trocar alias antes de deploy:

```bash
cd mobile
firebase use staging
firebase deploy --only firestore:rules,functions

firebase use prod
firebase deploy --only firestore:rules,functions
```

---

## Variáveis por ambiente (app)

Template: `mobile/.env.example`

| Variável | Dev | Staging | Prod |
|----------|-----|---------|------|
| `EXPO_PUBLIC_FIREBASE_*` | projeto dev | projeto staging | projeto prod |
| `EXPO_PUBLIC_FUNCTIONS_EMULATOR` | `1` ok | **não** | **não** |
| `EXPO_PUBLIC_STRIPE_MOCK_LOCAL` | opcional | **não** | **não** |
| OAuth client IDs | console dev | console staging | console prod (cliente) |

Push para EAS:

```bash
cd mobile
eas env:push --environment development --path .env.dev
eas env:push --environment preview --path .env.staging
eas env:push --environment production --path .env.prod
```

Confirme no [expo.dev](https://expo.dev) → projeto → **Environment variables**.

Detalhes: `mobile/BUILD_APK.md`, `docs/credentials-matrix.md`.

---

## Backend (Cloud Functions) por projeto

```bash
cd mobile
firebase use staging
firebase functions:secrets:set META_APP_SECRET
firebase functions:secrets:set OPENAI_API_KEY
# ... demais secrets

firebase deploy --only functions
```

URLs de OAuth/webhook Meta **mudam** com `PROJECT_ID`:

| URL | Padrão |
|-----|--------|
| OAuth callback | `https://us-central1-<PROJECT_ID>.cloudfunctions.net/oauthCallback` |
| Meta webhook | `https://us-central1-<PROJECT_ID>.cloudfunctions.net/metaWebhook` |

Reconfigurar nos painéis Meta/LinkedIn **por ambiente**.

---

## EAS — perfis (`mobile/eas.json`)

| Profile | Distribution | Android | Channel | Ambiente lógico |
|---------|--------------|---------|---------|-----------------|
| `development` | internal | APK (dev client) | — | Dev |
| `preview` | internal | APK | `preview` | Staging / QA |
| `preview-testflight` | store | — | `preview` | Staging iOS |
| `production` | store | AAB | `production` | Produção |

Build:

```bash
eas build --profile preview --platform android    # staging
eas build --profile production --platform all   # prod
```

---

## Fluxos perigosos — só staging

| Fluxo | Risco em prod |
|-------|----------------|
| Restore Firestore | Perda/sobreposição de dados |
| Stripe webhook live sem validação | Cobranças reais |
| Meta webhook prod | Mensagens a usuários reais |
| Delete collection / script Admin | Irreversível sem backup |
| Load test agressivo | Custo e throttling |

Usar projeto `staging` + contas de teste. Ver `docs/backup-and-recovery.md`.

---

## Passos de migração (de `karen-eaaf4`)

1. **Cliente** cria (ou recebe) projeto GCP/Firebase de **produção**.
2. **Borderless** cria projeto **staging** (ou renomeia uso atual de `karen-eaaf4` como staging only).
3. Atualizar `mobile/.firebaserc` com aliases `dev`, `staging`, `prod`.
4. Deploy rules, indexes, functions em staging → validar QA (`docs/qa-acceptance-checklist.md`).
5. Configurar EAS env `production` com credenciais do projeto prod.
6. Configurar secrets prod; Meta/Stripe/OpenAI em modo live **somente** no projeto prod.
7. Habilitar backup/PITR em prod (`docs/backup-and-recovery.md`).
8. App Check em prod (`docs/credentials-matrix.md`).
9. Cutover: build `production` apontando para `summus-prod`; monitorar logs 24–48 h.

---

## Referências

| Arquivo | Conteúdo |
|---------|----------|
| `mobile/.firebaserc` | Aliases Firebase |
| `mobile/eas.json` | Perfis de build |
| `mobile/.env.example` | Variáveis do app |
| `docs/credentials-matrix.md` | Quem fornece cada credencial |
| `docs/production-hardening-checklist.md` | Status geral de hardening |
