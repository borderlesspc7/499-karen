# Firestore Security Rules — Summus Edge

## Modelo

- Autenticação obrigatória para dados de negócio.
- Isolamento por `request.auth.uid` (`isOwner` / `ownsResource` / `createsOwnResource`).
- Mensagens do inbox: **leitura** pelo dono da conversa; **escrita** somente Admin SDK.
- `integration_secrets`, eventos Stripe e checkout: **negado** no cliente.
- Preferência de idioma (`preferredLocale`) no doc `users/{uid}` — gravável pelo dono.
- Catch-all explícito `match /{document=**}` com deny.

## Evidência

- Rules: `mobile/firestore.rules`
- Storage: `mobile/storage.rules`
- Testes: `mobile/tests/firestore.rules.test.ts`

## Como rodar os testes

```bash
cd mobile
firebase emulators:exec --only firestore "npm run test:rules"
```

Requer Java (Firestore Emulator) e deps de dev (`vitest`, `@firebase/rules-unit-testing`).

## Plano de teste cross-user

| # | Cenário | Esperado |
|---|---------|----------|
| 1 | User A lê conversa própria | Allow |
| 2 | User A lê conversa de B | Deny |
| 3 | User A lê mensagens de B | Deny |
| 4 | User A escreve mensagem (cliente) | Deny |
| 5 | Anônimo lê conversa | Deny |
| 6 | User A lê `integration_secrets` | Deny |
| 7 | User A lê `channel_connections` próprio | Allow |
| 8 | User A escreve `channel_connections` | Deny |
