# Checklist de hardening para produção — Summus Edge

Mapeamento dos requisitos de produção para status, evidência no repositório e validação.  
Última atualização: 2026-07-30.

## Legenda de status

| Status | Significado |
|--------|-------------|
| **Implementado** | Coberto no código/regras; falta apenas deploy ou validação formal |
| **Parcial** | Base existe; lacuna conhecida (UI, ops ou ambiente) |
| **Pendente (ops)** | Depende de GCP/Firebase Console, EAS ou ação da cliente — não é código |

---

## 1. Firestore Security Rules

| Campo | Valor |
|-------|-------|
| **Status** | Implementado |
| **Descrição** | Isolamento por `userId` / `ownsResource()` em todas as coleções de negócio. Mensagens somente leitura no cliente; escrita via Cloud Functions. Tokens OAuth, Stripe e webhooks bloqueados (`allow read, write: if false`). |
| **Evidência** | `mobile/firestore.rules`, `mobile/storage.rules`, `mobile/firebase.json`, `docs/firestore-security-rules.md`, `mobile/tests/firestore.rules.test.ts` |
| **Como validar** | `cd mobile && npm run test:rules:emulator`. Simulador Firebase: User A não lê/escreve doc de User B. |

---

## 2. Paginação de mensagens

| Campo | Valor |
|-------|-------|
| **Status** | Implementado |
| **Descrição** | Abertura de conversa carrega a página mais recente (`limitToLast`) com listener em tempo real. `useInboxMessages` e `InboxChatView` expõem carregamento incremental das páginas anteriores. Listagens de inbox/CRM usam `limit()` por coleção. |
| **Evidência** | `mobile/lib/firestore-limits.ts`, `mobile/lib/firestore-inbox-repository.ts`, `mobile/hooks/useInboxMessages.ts`, `mobile/components/inbox/InboxChatView.tsx` |
| **Como validar** | Abrir conversa com histórico maior que uma página e carregar mensagens anteriores até o início, sem duplicatas. Conferir no Firestore Usage que cada busca permanece limitada. QA formal: `docs/qa-acceptance-checklist.md` (seção Paginação). |

---

## 3. Performance e custo (Firestore)

| Campo | Valor |
|-------|-------|
| **Status** | Implementado |
| **Descrição** | Limites centralizados por feature; queries com `where('userId')` + `limit`; mensagens com `orderBy` + `limitToLast`; sem listeners na lista completa de conversas com subcoleção de mensagens. |
| **Evidência** | `mobile/lib/firestore-limits.ts`, repositórios `mobile/lib/firestore-*-repository.ts`, `mobile/hooks/useInboxConversations.ts`, `docs/firestore-read-costs.md` |
| **Como validar** | Firebase Console → Usage: picos ao abrir inbox/conversa proporcionais a N (não ao total do banco). Simular 1k/10k msgs conforme QA checklist. |

---

## 4. Credenciais e secrets

| Campo | Valor |
|-------|-------|
| **Status** | Parcial |
| **Descrição** | Secrets só em Cloud Functions (`defineSecret`); client SDK via env/EAS; `.env` fora do Git. Projetos Dev ≠ Prod e App Check ainda pendentes. |
| **Evidência** | `docs/credentials-matrix.md`, `mobile/functions/src/config.ts`, `mobile/.env.example`, `mobile/lib/env.ts`, `.gitignore` |
| **Como validar** | `grep -r "sk_live\|OPENAI\|META_APP_SECRET" mobile/app mobile/components` → vazio. Secrets listados no Firebase Console → Functions. Matriz preenchida com origem (cliente vs Borderless). |

---

## 5. Backup e recuperação

| Campo | Valor |
|-------|-------|
| **Status** | Pendente (ops) |
| **Descrição** | Estratégia documentada; ativação no GCP/Firebase Console (PITR + export agendado). Não há código de backup no app. |
| **Evidência** | `docs/backup-and-recovery.md` |
| **Como validar** | Console GCP: PITR habilitado; job de export para GCS ativo; teste de restore em projeto de staging (dry-run). |

---

## 6. Logs e observabilidade

| Campo | Valor |
|-------|-------|
| **Status** | Implementado (código) / Parcial (ops) |
| **Descrição** | Logger estruturado nas Cloud Functions (`info`/`warn`/`error`/`audit`). Alertas e dashboards permanecem configuração GCP. |
| **Evidência** | `mobile/functions/src/logger.ts`, handlers em `send-message`, `meta-webhook`, `channel-oauth`, `stripe-billing`, `ai-orchestration` |
| **Como validar** | GCP → Logging. Disparar `sendInboxMessage` / webhook Meta e confirmar entrada. Configurar alertas de erro 5xx (ops). |

---

## 7. Autenticação

| Campo | Valor |
|-------|-------|
| **Status** | Implementado |
| **Descrição** | Firebase Auth (e-mail/senha + social). Functions exigem `request.auth.uid`. Rules exigem `isSignedIn()` / `isOwner()`. Fluxos: login, logout, reset, verificação de e-mail. |
| **Evidência** | `shared/contexts/AuthContext.tsx`, `shared/services/auth-backend.ts`, `mobile/app/login.tsx`, `mobile/app/verify-email.tsx`, `mobile/functions/src/send-message.ts`, `mobile/firestore.rules` |
| **Como validar** | QA checklist (Auth + cross-user). Token expirado: logout forçado ou erro nas callable functions. |

---

## 8. Proteção contra abuso

| Campo | Valor |
|-------|-------|
| **Status** | Implementado |
| **Descrição** | Auth, ownership e rate limiting explícito protegem os endpoints sensíveis. App Check permanece **Parcial** e opt-in (`ENFORCE_APP_CHECK = false`) até todos os clientes enviarem tokens válidos. |
| **Evidência** | `mobile/functions/src/rate-limit.ts`, `mobile/functions/src/app-check.ts`, `mobile/functions/src/send-message.ts`, `mobile/functions/src/ai-orchestration.ts`, `mobile/functions/src/channel-oauth.ts`, `mobile/functions/src/stripe-billing.ts` |
| **Como validar** | Chamadas não autenticadas → `unauthenticated`; bursts acima dos presets → `resource-exhausted`. Validar App Check em staging antes de habilitar `ENFORCE_APP_CHECK`. |

---

## 9. Separação de ambientes

| Campo | Valor |
|-------|-------|
| **Status** | Pendente (ops) |
| **Descrição** | Hoje um único projeto Firebase (`karen-eaaf4`). Documentação de migração para dev/staging/prod separados. |
| **Evidência** | `mobile/.firebaserc`, `docs/environments.md`, `docs/credentials-matrix.md` |
| **Como validar** | `.firebaserc` com aliases distintos; EAS env `preview` ≠ `production` com `EXPO_PUBLIC_FIREBASE_PROJECT_ID` diferentes; nenhum teste destrutivo apontando para prod. |

---

## 10. Entrega de código (build e deploy)

| Campo | Valor |
|-------|-------|
| **Status** | Parcial |
| **Descrição** | EAS Build (preview APK, production AAB/TestFlight). Deploy manual de Functions/Rules via Firebase CLI. Sem pipeline CI no repositório. |
| **Evidência** | `mobile/eas.json`, `mobile/BUILD_APK.md`, `mobile/firebase.json`, `mobile/CHANNEL_INTEGRATIONS.md` |
| **Como validar** | `eas build --profile preview` com env no Expo. `firebase deploy --only functions,firestore:rules` em staging. Checklist de release antes de prod. |

---

## 11. Internacionalização (i18n)

| Campo | Valor |
|-------|-------|
| **Status** | Implementado |
| **Descrição** | pt-BR, en-US e es-ES; detecção por idioma/região do dispositivo no 1º acesso; seleção manual; persistência local + `preferredLocale` no perfil Firestore. |
| **Evidência** | `shared/i18n/`, `shared/i18n/detect-locale.ts`, `shared/i18n/dictionaries/es-ES.ts`, `mobile/components/AppLocaleProvider.tsx`, `mobile/lib/firestore-locale-repository.ts`, `mobile/components/ui/LanguageSelector.tsx` |
| **Como validar** | Device em ES → app abre em espanhol; trocar idioma no perfil; relogar em outro device com mesma conta → preferência remota. |

---

## Documentos relacionados

| Documento | Conteúdo |
|-----------|----------|
| `docs/credentials-matrix.md` | Matriz a–f, App Check, staging |
| `docs/backup-and-recovery.md` | PITR, export GCS, RPO/RTO |
| `docs/environments.md` | Dev / staging / prod |
| `docs/qa-acceptance-checklist.md` | Testes de aceite |
| `docs/firestore-read-costs.md` | Modelo de leituras |
| `docs/firestore-security-rules.md` | Modelo de acesso e testes cross-user |
