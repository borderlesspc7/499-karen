# Backup e recuperação — Firestore (Summus Edge)

Estratégia operacional para dados Firestore. **Configuração no Google Cloud / Firebase Console** — não há código de backup no aplicativo.

Última atualização: 2026-07-30.

---

## Recomendação

Combinar duas camadas:

| Camada | Finalidade |
|--------|------------|
| **Point-in-Time Recovery (PITR)** | Restore granular dentro da janela de retenção (ex.: exclusão acidental, corrupção recente) |
| **Export agendado para Cloud Storage (GCS)** | Cópias offline, retenção longa, restore em outro projeto, auditoria |

---

## PITR (Firestore)

1. Firebase Console → **Firestore Database** → **Disaster Recovery** (ou GCP Console → Firestore → PITR).
2. Habilitar PITR no projeto de **produção** (e opcionalmente staging).
3. Retenção: conforme plano Firebase (até 7 dias na janela PITR padrão — confirmar no console na data do go-live).

**Uso típico:** restaurar banco ou coleção para um timestamp T (ex.: 30 min antes de um incidente).

Documentação oficial:
- [Point-in-time recovery (Firestore)](https://firebase.google.com/docs/firestore/use-pitr)
- [Restore data with PITR](https://cloud.google.com/firestore/docs/use-pitr)

---

## Export agendado para GCS

1. Criar bucket GCS dedicado (ex.: `gs://summus-prod-firestore-backups`), região alinhada ao Firestore (ex.: `us-central1`).
2. Agendar export via **Cloud Scheduler** + **Cloud Functions** ou job gerenciado (Firestore export API).
3. IAM mínima no service account do export: `roles/datastore.importExportAdmin` + escrita no bucket.

### Frequência sugerida

| Ambiente | Frequência | Retenção GCS |
|----------|------------|--------------|
| Produção | Diário (off-peak) | 30–90 dias (lifecycle no bucket) |
| Staging | Semanal | 14 dias |
| Dev | Opcional / manual | 7 dias |

### Formato

Export nativo Firestore (`export` operation) → prefixo no bucket com timestamp (`/YYYY-MM-DD/`).

Documentação oficial:
- [Scheduled backups (Firestore export)](https://firebase.google.com/docs/firestore/solutions/schedule-export)
- [Export and import data](https://firebase.google.com/docs/firestore/manage-data/export-import)

---

## Quem acessa backups (IAM)

| Papel | Acesso | Quem |
|-------|--------|------|
| `roles/datastore.importExportAdmin` | Iniciar export/import | Service account do job de backup |
| `roles/storage.objectAdmin` (bucket específico) | Ler/escrever objetos de backup | SA do export; **não** developers day-to-day |
| `roles/storage.objectViewer` | Somente leitura | Líder técnico / DPO em incidente |
| Proprietário do projeto GCP | Controle total | Conta da **cliente** (produção) |

**Princípios:** backups fora do app mobile; nenhum developer usa credencial de SA localmente em prod; restore é evento raro, aprovado e registrado.

---

## Procedimento de restore (alto nível)

### Cenário A — PITR (incidente recente)

1. Congelar writes: desabilitar Functions críticas ou colocar app em manutenção (comunicação).
2. Firebase/GCP Console → Firestore → PITR → escolher timestamp alvo.
3. Restore para **novo** banco ou projeto de recuperação (recomendado primeiro em staging clone).
4. Validar amostra de documentos (`users`, `conversations`, `clients`).
5. Redirecionar app (novo `PROJECT_ID` / reconfig EAS) ou promover banco restaurado conforme runbook GCP.
6. Reativar Functions; monitorar logs.

### Cenário B — Import a partir de export GCS

1. Identificar prefixo do export (`gs://.../YYYY-MM-DD/`).
2. Firestore → Import → bucket + prefixo (pode ser outro projeto Firebase).
3. Índices: redeploy `mobile/firestore.indexes.json` se necessário.
4. Validar e cutover.

Documentação: [Import data](https://firebase.google.com/docs/firestore/manage-data/export-import#import_data)

---

## RPO e RTO sugeridos

| Métrica | Alvo | Notas |
|---------|------|-------|
| **RPO** | ≤ 1 h (com PITR) | Granularidade de minutos dentro da janela PITR |
| **RPO** (export diário) | ≤ 24 h | Fallback se PITR indisponível ou retenção longa |
| **RTO** | Horas (2–8 h+) | Depende do tamanho do banco e se restore é em projeto novo |

Ajustar com a cliente conforme volume de dados e SLA contratual.

---

## Escopo fora do backup Firestore

| Item | Onde |
|------|------|
| Secrets (Meta, Stripe, OpenAI) | Firebase Secret Manager / rotação manual — **recriar**, não exportar |
| Auth users | Firebase Auth export separado ([export users](https://firebase.google.com/docs/auth/admin/manage-users#export_and_import_users)) |
| Storage (imagens brand) | GCS lifecycle / versioning no bucket Storage |
| Config EAS | Expo dashboard + documentação `docs/environments.md` |

---

## Checklist ops (go-live)

- [ ] PITR habilitado em produção
- [ ] Bucket GCS + lifecycle policy
- [ ] Export agendado testado (job conclui com sucesso)
- [ ] Restore testado em projeto/banco de **staging** (não prod)
- [ ] Runbook de incidente com contatos e aprovadores
- [ ] IAM revisado (princípio do menor privilégio)
