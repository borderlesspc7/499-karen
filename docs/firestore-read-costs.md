# Custos de leitura Firestore — Inbox e listagens

Modelo esperado de billed reads para revisão de performance/custo. Valores default do código; ajustáveis em `mobile/lib/firestore-limits.ts`.

Última atualização: 2026-07-30.

---

## Limites default

| Recurso | Constante | Default |
|---------|-----------|---------|
| Mensagens por conversa (snapshot) | `FIRESTORE_PAGE_LIMITS.messages` | **80** |
| Conversas por usuário | `FIRESTORE_PAGE_LIMITS.conversations` | 100 |
| Clientes | `FIRESTORE_PAGE_LIMITS.clients` | 200 |
| Cards CRM | `FIRESTORE_PAGE_LIMITS.cards` | 300 |

---

## Abrir conversa (carga inicial)

**Query:** `messages` subcollection → `orderBy('createdAt', 'asc')` + `limitToLast(N)`  
**Implementação:** `mobile/hooks/useInboxMessages.ts`

| Operação | Reads faturados |
|----------|-----------------|
| Primeiro snapshot do listener | **até N** (1 read por documento retornado) |
| Conversa com < N mensagens | = número real de mensagens |
| Conversa com 10k mensagens | **ainda N** (não 10k) |

```
reads_abertura ≈ min(N, total_mensagens_conversa)
```

---

## Carregar página anterior (histórico)

**Query:** `orderBy('createdAt', 'asc')` + `limit(pageSize)` com cursor (`startAfter` / `endBefore` quando implementado na UI)  
**Implementação:** `mobile/lib/firestore-inbox-repository.ts` (`latest: false`)

| Operação | Reads faturados |
|----------|-----------------|
| Cada página adicional | **até pageSize** |

```
reads_paginacao_paginas = pageSize × num_paginas_carregadas
```

**Estado atual:** repositório pronto; UI de “carregar anteriores” ainda não exposta (`InboxChatView`).

---

## Atualizações em tempo real

Listener permanece na janela das últimas N mensagens.

| Evento | Reads |
|--------|-------|
| Nova mensagem na janela | +1 por documento **added/changed** no snapshot |
| Mensagem antiga fora da janela | 0 reads extras (sai do result set) |
| Edição de msg dentro da janela | +1 read (document change) |
| Reconexão / reopen app | Novo snapshot inicial → até N reads de novo |

```
reads_realtime_sessao ≈ reads_abertura + (Δ mensagens na janela durante sessão)
```

---

## Lista de conversas (inbox)

**Query:** `conversations` where `userId == uid` + `limit(100)`  
**Implementação:** `mobile/hooks/useInboxConversations.ts`

| Operação | Reads |
|----------|-------|
| Snapshot inicial | até 100 |
| Listener: conversa atualizada | +1 por doc changed |

Mensagens **não** são carregadas na listagem — apenas metadados da conversa.

---

## Outras listagens (CRM, campanhas, etc.)

Padrão: `where('userId', '==', uid)` + `limit(L)` por coleção.  
1 read por documento retornado por query/get.

---

## Fórmula resumida — sessão típica inbox

```
reads_sessao_inbox ≈
  min(L_conv, num_conversas)           // lista inbox
+ min(N, msgs_conversa_aberta)         // abrir 1 conversa
+ novas_mensagens_na_janela            // realtime
+ (pageSize × paginas_anteriores)      // se UI de histórico ativa
```

Exemplo: 100 conversas listadas (100 reads) + abrir 1 chat com 5k msgs, N=80 (80 reads) + 3 msgs novas (3 reads) = **183 reads** — não 5000+.

---

## Cenários de volume (QA)

| Mensagens totais na conversa | Reads na abertura (N=80) |
|------------------------------|--------------------------|
| 100 | 80 |
| 1 000 | 80 |
| 10 000 | 80 |

Validar no Firebase Console → Usage durante testes (`docs/qa-acceptance-checklist.md`).

---

## Recomendações

1. **Manter N entre 50–100** para UX vs custo; expor paginação sob demanda para histórico longo.
2. **Evitar** `getDocs` sem `limit` em coleções grandes.
3. **Evitar** listener em query que cresce sem bound (usar sempre `limitToLast`).
4. **Índices:** `createdAt` em `messages` — `mobile/firestore.indexes.json`.
5. **Monitorar** Usage por release; alertas de custo no GCP Billing.
6. **App Check** reduz abuso que inflaria reads (ver `docs/credentials-matrix.md`).

---

## Referências no código

| Arquivo | Papel |
|---------|-------|
| `mobile/lib/firestore-limits.ts` | Constantes N |
| `mobile/hooks/useInboxMessages.ts` | Listener `limitToLast` |
| `mobile/lib/firestore-inbox-repository.ts` | Listagem paginada (API) |
| `mobile/hooks/useInboxConversations.ts` | Lista conversas limitada |
| `docs/production-hardening-checklist.md` | Status performance |

Documentação Firebase: [Understand Cloud Firestore billing](https://firebase.google.com/docs/firestore/pricing)
