# Checklist do que foi feito — 30/07/2026

Pacote de hardening / prontidão para produção + resposta sobre chaves + i18n.

---

## Documentação e alinhamento com a cliente

- [x] Análise do pedido da cliente vs. estado do projeto
- [x] Matriz de credenciais (a–f): `docs/credentials-matrix.md`
- [x] Checklist de hardening: `docs/production-hardening-checklist.md`
- [x] Backup e recuperação (PITR / export / RPO-RTO): `docs/backup-and-recovery.md`
- [x] Ambientes Dev / Staging / Prod: `docs/environments.md`
- [x] QA de aceite (auth, cross-user, paginação, carga): `docs/qa-acceptance-checklist.md`
- [x] Custos de reads Firestore: `docs/firestore-read-costs.md`
- [x] Security Rules documentadas: `docs/firestore-security-rules.md`

---

## 1. Histórico de mensagens (tipo WhatsApp)

- [x] Paginação por cursor (páginas de 50 mensagens)
- [x] Infinite scroll ao subir a conversa (`loadOlderMessages`)
- [x] Histórico antigo preservado (não substituído pelo realtime)
- [x] Deduplicação por `id`
- [x] Ordem cronológica mantida
- [x] Métricas de reads (`initialReads`, `olderReads`, `realtimeReads`)
- [x] UI: indicador de loading no topo + sem salto ao prepend

**Arquivos:** `mobile/hooks/useInboxMessages.ts`, `mobile/components/inbox/InboxChatView.tsx`, `mobile/lib/firestore-limits.ts`, `mobile/lib/firestore-inbox-repository.ts`

---

## 2. Firestore — segurança

- [x] Rules reforçadas (campos mínimos no create, catch-all deny)
- [x] Isolamento por usuário mantido / documentado
- [x] Escrita de mensagens só via backend (inalterado, revalidado)
- [x] Testes unitários de acesso cruzado (Vitest + `@firebase/rules-unit-testing`)
- [x] Scripts: `npm run test:rules` / `npm run test:rules:emulator`

**Arquivos:** `mobile/firestore.rules`, `mobile/tests/firestore.rules.test.ts`, `mobile/vitest.rules.config.ts`

---

## 3. Proteção contra abuso + App Check

- [x] Rate limiting nas Cloud Functions (mensagens 30/min, AI 20/min, OAuth 10/min, checkout 10/min)
- [x] Logger estruturado (`info` / `warn` / `error` / `audit`)
- [x] App Check opt-in (Web + ReCAPTCHA); enforce desligado até validar clientes
- [x] Vars documentadas em `.env.example` e na matriz de credenciais

**Arquivos:** `mobile/functions/src/rate-limit.ts`, `logger.ts`, `app-check.ts`, callables atualizadas, `mobile/lib/firebase.ts`

---

## 4. Internacionalização (PT / EN / ES)

- [x] Locale `es-ES` com dicionário completo (~901 keys)
- [x] Detecção automática (idioma do device + região)
- [x] Seleção manual no perfil (3 idiomas)
- [x] Persistência local (AsyncStorage)
- [x] Sync no perfil Firestore (`preferredLocale`)
- [x] `expo-localization` integrado via `AppLocaleProvider`

**Arquivos:** `shared/i18n/dictionaries/es-ES.ts`, `shared/i18n/detect-locale.ts`, `shared/types/locale.ts`, `shared/contexts/LocaleContext.tsx`, `mobile/components/AppLocaleProvider.tsx`, `mobile/lib/firestore-locale-repository.ts`, `mobile/components/ui/LanguageSelector.tsx`

---

## Ainda pendente (ops / cliente — não é só código)

- [ ] Projetos Firebase separados (Dev / Staging / Prod)
- [ ] Ativar PITR + export de backup no GCP
- [ ] Enforce App Check em produção (após todos os clients tokenizados)
- [ ] Chaves de produção da cliente (Meta, Stripe live, OpenAI, etc.)
- [ ] Transferência de contas GCP/Firebase/GitHub para a cliente
- [ ] Revisão humana do copy em espanhol (tom cultural)
- [ ] Rodar e anexar evidências do QA checklist (`docs/qa-acceptance-checklist.md`)
- [ ] Deploy das rules/functions atualizadas no Firebase

---

## Como validar rápido

```bash
cd mobile && npx tsc --noEmit
cd mobile && npm run test:rules:emulator   # Java + emulador Firestore
cd mobile && npm run deploy:functions      # quando for publicar
```

Ver status consolidado: `docs/production-hardening-checklist.md`
