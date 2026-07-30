# Checklist de aceite QA — Summus Edge

Testes solicitados para validação pré-produção. Preencher a coluna **Evidência** após execução.

Última atualização: 2026-07-30.  
Ambiente recomendado: **staging** (nunca prod para testes destrutivos).

---

## Legenda

| Resultado | Significado |
|-----------|-------------|
| **Pass** | Comportamento correto |
| **Fail** | Bug ou requisito não atendido |
| **N/A** | Não aplicável neste release |

**Evidência:** `Pass/Fail · AAAA-MM-DD · observação breve` (screenshot, UID, conversa ID, etc.).

---

## 1. Isolamento entre usuários (cross-user)

Pré-requisito: duas contas reais **User A** e **User B** no mesmo projeto Firebase staging.

| # | Cenário | Passos | Resultado esperado | Evidência |
|---|---------|--------|-------------------|-----------|
| 1.1 | Conversas | A cria/vê conversas; B lista inbox | B **não** vê conversas de A | |
| 1.2 | Mensagens | A abre conversa própria | B não lê mensagens via app (Rules negam) | |
| 1.3 | CRM clientes | A cria cliente | B não vê cliente de A | |
| 1.4 | CRM kanban | A cria card/coluna | B não vê card de A | |
| 1.5 | Campanhas | A salva campanha | B não acessa campanha de A | |
| 1.6 | Perfil `/users/{uid}` | A lê próprio doc | B não lê doc de A | |
| 1.7 | Callable `sendInboxMessage` | B chama com `conversationId` de A | Erro `permission-denied` | |
| 1.8 | Storage brand | A faz upload em `users/{uidA}/brand/` | B não lê path de A | |

Referência Rules: `mobile/firestore.rules`, `mobile/storage.rules`.

Teste automatizado das regras (requer Java e Firebase CLI):

```bash
cd mobile
firebase emulators:exec --only firestore "npm run test:rules"
```

---

## 2. Autenticação

| # | Cenário | Passos | Resultado esperado | Evidência |
|---|---------|--------|-------------------|-----------|
| 2.1 | Login válido | E-mail/senha corretos | Entra no app; `currentUser` definido | |
| 2.2 | Login inválido | Senha errada | Mensagem de erro; permanece na login | |
| 2.3 | Logout | Sair do app | Volta à login; listeners param | |
| 2.4 | Reset senha | Esqueci senha | E-mail de reset (Firebase Auth) | |
| 2.5 | Cadastro | Nova conta | Conta criada; fluxo pós-signup ok | |
| 2.6 | E-mail não verificado | Conta sem verify (se enforced) | Bloqueio ou aviso conforme produto | |
| 2.7 | Sessão expirada | Revogar token / esperar expiry | Callable retorna `unauthenticated`; app trata | |
| 2.8 | Cross-access pós-logout | Logout A → tentar dados A sem login | Acesso negado | |
| 2.9 | Social login | Google/Apple/Facebook (se habilitado) | Login ok; mesmo isolamento userId | |

Referência: `shared/contexts/AuthContext.tsx`, telas `mobile/app/login.tsx`, `mobile/app/verify-email.tsx`.

---

## 3. Paginação de mensagens

Default no código: **80** mensagens (`FIRESTORE_PAGE_LIMITS.messages`). Testes 20/50/100: ajustar temporariamente `mobile/lib/firestore-limits.ts` ou usar `listMessages(..., { limit: N })` via staging build.

| # | Cenário | Passos | Resultado esperado | Evidência |
|---|---------|--------|-------------------|-----------|
| 3.1 | Abertura N=20 | Conversa com ≥50 msgs; limit=20 | Exibe 20 mais recentes; ordem cronológica | |
| 3.2 | Abertura N=50 | idem | 50 recentes | |
| 3.3 | Abertura N=100 | idem | 100 recentes (ou total se <100) | |
| 3.4 | Default N=80 | Build padrão; conversa com ≥120 msgs | 80 recentes; sem scan total | |
| 3.5 | Carregar anteriores | Rolar ao topo e acionar carregamento | Busca a página anterior; mantém ordem e não duplica mensagens | |
| 3.6 | Sem duplicatas | Reabrir mesma conversa 3x | Mesmos IDs; sem msgs repetidas na lista | |
| 3.7 | Ordem | Comparar timestamps | Sempre ascendente (antiga → nova) | |
| 3.8 | Reabrir app | Kill app → reopen conversa | Snapshot inicial ≤ N reads; lista consistente | |
| 3.9 | Nova mensagem realtime | Enviar msg enquanto aberta | Aparece no fim; listener incrementa 1 read/doc changed | |

Referência: `mobile/hooks/useInboxMessages.ts`, `mobile/lib/firestore-inbox-repository.ts`.

---

## 4. Performance (volume de mensagens)

Medir em **staging** com dados sintéticos (script Admin SDK ou import). Monitorar Firebase Usage → Firestore reads.

| # | Cenário | Setup | Critério de aceite (orientativo) | Evidência |
|---|---------|-------|-----------------------------------|-----------|
| 4.1 | 1k msgs / conversa | 1 conversa, 1000 docs em `messages` | Abrir conversa: reads ≈ N (80 default), não 1000 | |
| 4.2 | 10k msgs / conversa | 10000 docs | Idem; tempo de abertura aceitável (<3s em rede normal) | |
| 4.3 | 100 conversas | User com 100 conversas | Lista inbox ≤ `FIRESTORE_PAGE_LIMITS.conversations` (100) reads | |
| 4.4 | Uso prolongado | 30 min navegando inbox | Sem crescimento linear de reads com total histórico | |

Ver modelo: `docs/firestore-read-costs.md`.

---

## 5. Rate limit e abuso

| # | Cenário | Passos | Resultado esperado | Evidência |
|---|---------|--------|-------------------|-----------|
| 5.1 | Callable sem auth | Chamar function sem token | `unauthenticated` | |
| 5.2 | Burst envio msgs | 20 envios rápidos autenticados | Sucesso ou throttle graceful; sem crash | |
| 5.3 | IA (`generateSmartReplies`) | Muitas chamadas seguidas | Erro claro ou quota; sem vazamento de API key | |
| 5.4 | App Check | *Pendente hardening* | Requests rejeitados sem token App Check (após deploy) | |

Referência: `mobile/functions/src/send-message.ts`, `mobile/functions/src/ai-orchestration.ts`.

---

## 6. i18n (amostra)

| # | Cenário | Resultado esperado | Evidência |
|---|---------|-------------------|-----------|
| 6.1 | pt-BR default | Textos em português | |
| 6.2 | en-US | Alternar idioma; UI em inglês | |
| 6.3 | Erros auth | Mensagens localizadas, não codes crus | |

Referência: `shared/i18n/dictionaries/`.

---

## Resumo de execução

| Área | Total casos | Pass | Fail | N/A | Responsável | Data |
|------|-------------|------|------|-----|-------------|------|
| Cross-user | 8 | | | | | |
| Auth | 9 | | | | | |
| Paginação | 9 | | | | | |
| Performance | 4 | | | | | |
| Abuso | 4 | | | | | |
| i18n | 3 | | | | | |

**Aprovação release:** _________________________ Data: __________
