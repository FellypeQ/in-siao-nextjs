# SPEC 009 - Fluxo de Mensagens para Visitantes

## 1. Contexto

O sistema precisa suportar um fluxo de mensagens sequenciais enviadas via WhatsApp para visitantes cadastrados. As mensagens seguem uma ordem configurável, e o sistema deve registrar quais mensagens foram enviadas para cada visitante, mantendo histórico mesmo se os templates forem editados ou excluídos.

## 2. Objetivo de Negocio

Permitir que a equipe gerencie um fluxo ordenado de mensagens para visitantes, acompanhe o progresso de envio por visitante e acione o WhatsApp Web com o texto preparado para envio da próxima mensagem pendente.

## 3. Escopo

### 3.1 Em escopo

- Criação de model `MessageTemplate` (título, corpo com suporte a `{nome_do_usuario}`, ordem, soft delete)
- Criação de model `MemberMessageLog` (registro imutável de cada mensagem enviada, com snapshot de título e corpo processado)
- Novas permissões: `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR`
- Tela de gerenciamento de templates de mensagem (`/mensagens`) — requer `MENSAGENS_GERENCIAR`
- Card "Mensagens" na home de visitantes (SPEC 007) — visível com `MENSAGENS_GERENCIAR` ou `MENSAGENS_ENVIAR`
- Stepper MUI no detalhe do visitante exibindo mensagens enviadas e próximas
- Botão "Enviar próxima mensagem" no detalhe do visitante — requer `MENSAGENS_ENVIAR`
- Ao clicar em enviar: diálogo de confirmação com preview da mensagem → após confirmar, registra o envio no banco e abre WhatsApp Web
- Substituição de `{nome_do_usuario}` pelo primeiro nome do visitante (primeiro token do `split(" ")` do campo `name`)
- Exclusão de template: soft delete se template já foi enviado a algum visitante; hard delete se nunca enviado
- Ao excluir (soft): template não aparece mais no fluxo de novos envios, mas aparece no histórico de visitantes que já o receberam

### 3.2 Fora de escopo

- Drag and drop para reordenar templates
- Envio automático de mensagens (sem interação humana)
- Integração com API oficial do WhatsApp Business
- Notificações push para o usuário responsável pelo envio
- Filtros ou busca na tela de templates

## 4. Requisitos Funcionais

- **RF-01**: Cadastrar, editar e excluir templates de mensagem com título, corpo e ordem
- **RF-02**: Corpo do template suporta placeholder `{nome_do_usuario}` que é substituído pelo primeiro nome do visitante no momento do envio
- **RF-03**: Exclusão de template: soft delete se `MemberMessageLog` referencia o template; hard delete se nunca enviado
- **RF-04**: Listagem de templates na tela `/mensagens` exibe somente templates ativos (não soft-deleted), ordenados por `order`
- **RF-05**: Stepper no detalhe do visitante exibe todos os templates ativos em ordem; marca como concluídos os que possuem `MemberMessageLog` para o visitante
- **RF-06**: "Próxima mensagem" = primeiro template ativo (não soft-deleted) que ainda não foi enviado ao visitante (por `MemberMessageLog`)
- **RF-07**: Botão "Enviar próxima mensagem" abre diálogo com preview do título, corpo processado e número de telefone do visitante
- **RF-08**: Ao confirmar no diálogo: cria `MemberMessageLog` (com snapshot do título e corpo processado) e abre WhatsApp Web (`https://wa.me/55<dígitos>?text=<corpo_codificado>`)
- **RF-09**: Card "Mensagens" adicionado à home de visitantes (SPEC 007), visível para usuários com `MENSAGENS_GERENCIAR` ou `MENSAGENS_ENVIAR`
- **RF-10**: `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR` adicionados às constantes de permissões e ao `PERMISSIONS_BY_MODULE`

## 5. Requisitos Nao Funcionais

- **RNF-01**: `MemberMessageLog` é imutável após criação — representa fato histórico de envio
- **RNF-02**: Soft delete via campo `deletedAt: DateTime?` em `MessageTemplate`
- **RNF-03**: WhatsApp Web URL usa `encodeURIComponent` no corpo da mensagem
- **RNF-04**: Snapshot do corpo é o texto já processado (com nome substituído) — não o template raw
- **RNF-05**: Número de telefone para WhatsApp: `55` + dígitos armazenados (sem formatação)
- **RNF-06**: Tela `/mensagens` protegida por `MENSAGENS_GERENCIAR`; botão de envio no detalhe do visitante protegido por `MENSAGENS_ENVIAR`

## 6. Modelagem de Dados (quando aplicavel)

### Novos models no `prisma/schema.prisma`

```prisma
model MessageTemplate {
  id        String    @id @default(cuid())
  title     String
  body      String
  order     Int
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  sentLogs  MemberMessageLog[]
}

model MemberMessageLog {
  id                  String           @id @default(cuid())
  memberId            String
  member              Member           @relation(fields: [memberId], references: [id])
  messageTemplateId   String?
  messageTemplate     MessageTemplate? @relation(fields: [messageTemplateId], references: [id])
  messageTitle        String
  messageBody         String
  sentAt              DateTime         @default(now())
  sentByUserId        String
  sentByUser          User             @relation(fields: [sentByUserId], references: [id])
}
```

### Alterações em models existentes

- `Member`: adicionar relação `messageLogs MemberMessageLog[]`
- `User`: adicionar relação `sentMessageLogs MemberMessageLog[]`

### Migration

```
npx prisma migrate dev --name add-message-templates-and-logs
```

### Novas permissões (sem migração de banco — constantes TypeScript)

```ts
// src/shared/constants/permissions.ts
"MENSAGENS_GERENCIAR",
"MENSAGENS_ENVIAR",
```

Adicionadas ao módulo `"Mensagens"` em `PERMISSIONS_BY_MODULE`.

## 7. Fluxos Funcionais

### Fluxo 1 — Gerenciar templates (`/mensagens`)

1. Usuário acessa `/mensagens` (requer `MENSAGENS_GERENCIAR`)
2. Vê listagem de templates ativos ordenados por `order`
3. Pode adicionar novo template ao final (maior `order` atual + 1)
4. Pode editar título, corpo ou ordem de template existente
5. Pode excluir: sistema verifica se há `MemberMessageLog` referenciando o template
   - Sem logs → hard delete
   - Com logs → soft delete (`deletedAt = now()`)
6. Template soft-deleted some da listagem da tela de templates

### Fluxo 2 — Detalhe do visitante com stepper

1. Usuário acessa detalhe do visitante
2. Busca `GET /api/visitantes/[id]/mensagens` → retorna templates ativos + histórico do visitante
3. Stepper exibe templates ativos em ordem, marcando como concluídos os enviados
4. Último passo concluído e próximo pendente ficam destacados

### Fluxo 3 — Enviar próxima mensagem

1. Usuário clica "Enviar próxima mensagem" (requer `MENSAGENS_ENVIAR`)
2. Sistema identifica próxima mensagem pendente
3. Processa corpo: substitui `{nome_do_usuario}` pelo primeiro nome do visitante
4. Abre diálogo com preview: título, corpo processado, telefone do visitante
5. Usuário confirma → `POST /api/visitantes/[id]/mensagens` (cria log com snapshot)
6. Após resposta 201 → abre WhatsApp Web em nova aba com URL codificada
7. Frontend atualiza stepper com o novo passo concluído

## 8. Contratos de Camadas (Arquitetura)

### Módulo `mensagens`
- **Controller** `api/mensagens/route.ts`: GET (list) + POST (create)
- **Controller** `api/mensagens/[id]/route.ts`: PUT (update) + DELETE (soft/hard delete)
- **Service** `list-message-templates.service.ts`: busca templates ativos ordenados
- **Service** `create-message-template.service.ts`: cria template com order = max+1
- **Service** `update-message-template.service.ts`: atualiza título, corpo ou order
- **Service** `delete-message-template.service.ts`: decide soft vs hard delete
- **Repositories**: espelham cada service

### Módulo `visitantes` (extensão)
- **Controller** `api/visitantes/[id]/mensagens/route.ts`: GET (histórico + próxima) + POST (log envio)
- **Service** `get-visitante-mensagens.service.ts`: retorna templates ativos + logs do visitante
- **Service** `log-mensagem-visitante.service.ts`: valida próxima mensagem, cria log com snapshot processado
- **Repositories**: espelham cada service

## 9. Endpoints (quando aplicavel)

### GET /api/mensagens
**Guard**: `MENSAGENS_GERENCIAR`
**Response 200**: `MessageTemplate[]` (somente ativos, ordenados por `order`)

### POST /api/mensagens
**Guard**: `MENSAGENS_GERENCIAR`
**Body**: `{ title: string, body: string }`
**Response 201**: `MessageTemplate` criado

### PUT /api/mensagens/[id]
**Guard**: `MENSAGENS_GERENCIAR`
**Body**: `{ title?: string, body?: string, order?: number }`
**Response 200**: `MessageTemplate` atualizado

### DELETE /api/mensagens/[id]
**Guard**: `MENSAGENS_GERENCIAR`
**Response 200**: `{ deleted: "hard" | "soft" }`

### GET /api/visitantes/[id]/mensagens
**Guard**: `MENSAGENS_ENVIAR` ou `MENSAGENS_GERENCIAR`
**Response 200**:
```json
{
  "templates": [{ "id": "", "title": "", "body": "", "order": 1 }],
  "sentLogs": [{ "id": "", "messageTemplateId": "", "messageTitle": "", "sentAt": "" }],
  "nextTemplate": { "id": "", "title": "", "processedBody": "" } | null
}
```

### POST /api/visitantes/[id]/mensagens
**Guard**: `MENSAGENS_ENVIAR`
**Body**: `{ messageTemplateId: string }`
**Response 201**: `MemberMessageLog` criado (com snapshot)

## 10. Estrutura de Arquivos (proposta)

```
src/
  app/
    (web_pages)/
      mensagens/
        page.tsx                                ← [NOVO]
    api/
      mensagens/
        route.ts                                ← [NOVO] GET + POST
        [id]/
          route.ts                              ← [NOVO] PUT + DELETE
      visitantes/
        [id]/
          mensagens/
            route.ts                            ← [NOVO] GET + POST

  frontend/
    features/
      mensagens/
        components/
          mensagens-page-view.tsx               ← [NOVO] listagem + CRUD de templates
          message-template-form.tsx             ← [NOVO] form de template
          delete-template-dialog.tsx            ← [NOVO]
      visitantes/
        components/
          visitante-mensagens-stepper.tsx       ← [NOVO] stepper de progresso
          enviar-mensagem-dialog.tsx            ← [NOVO] preview + confirmação

  modules/
    mensagens/
      services/
        list-message-templates.service.ts       ← [NOVO]
        create-message-template.service.ts      ← [NOVO]
        update-message-template.service.ts      ← [NOVO]
        delete-message-template.service.ts      ← [NOVO]
      repositories/
        list-message-templates.repository.ts    ← [NOVO]
        create-message-template.repository.ts   ← [NOVO]
        update-message-template.repository.ts   ← [NOVO]
        delete-message-template.repository.ts   ← [NOVO]
      schemas/
        message-template.schema.ts              ← [NOVO]
      types/
        message-template.type.ts                ← [NOVO]
    visitantes/
      services/
        get-visitante-mensagens.service.ts      ← [NOVO]
        log-mensagem-visitante.service.ts       ← [NOVO]
      repositories/
        get-visitante-mensagens.repository.ts   ← [NOVO]
        log-mensagem-visitante.repository.ts    ← [NOVO]

  shared/
    constants/
      permissions.ts                            ← adicionar MENSAGENS_GERENCIAR + MENSAGENS_ENVIAR [MODIFICADO]

  prisma/
    schema.prisma                               ← [MODIFICADO] novos models

test/
  app/
    api/
      mensagens/
        route.test.ts
        [id]/route.test.ts
      visitantes/
        [id]/
          mensagens/route.test.ts
  modules/
    mensagens/
      services/
        list-message-templates.service.test.ts
        create-message-template.service.test.ts
        delete-message-template.service.test.ts
    visitantes/
      services/
        get-visitante-mensagens.service.test.ts
        log-mensagem-visitante.service.test.ts
  frontend/
    features/
      mensagens/
        components/
          mensagens-page-view.test.tsx
      visitantes/
        components/
          visitante-mensagens-stepper.test.tsx
```

## 11. Regras de Validacao

### Schema `message-template.schema.ts`
- `title`: string, min 1, max 100
- `body`: string, min 1, max 2000
- `order`: number inteiro positivo (opcional no create — calculado automaticamente)

### Regras de negócio
- `{nome_do_usuario}` no corpo é substituído pelo primeiro token de `Member.name.split(" ")[0]` antes do envio
- Soft delete: `deletedAt = now()` — template permanece no banco mas é excluído das queries de templates ativos
- Hard delete: remoção física — somente se `count(MemberMessageLog where messageTemplateId = id) === 0`
- `nextTemplate`: primeiro template ativo (`deletedAt = null`) ordenado por `order`, cujo `id` não está em nenhum `MemberMessageLog.messageTemplateId` do visitante

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado usuário com `MENSAGENS_GERENCIAR`, quando acessa `/mensagens`, então vê a listagem de templates ativos ordenados
- **CA-02** (RF-02): Dado template com `{nome_do_usuario}` no corpo, quando enviado para visitante "Maria Silva", então o log salva "Maria" substituído
- **CA-03** (RF-03): Dado template nunca enviado, quando excluído, então é removido fisicamente do banco
- **CA-04** (RF-03): Dado template já enviado a um visitante, quando excluído, então `deletedAt` é preenchido e não aparece mais na listagem de templates ativos
- **CA-05** (RF-04): Dado template soft-deleted, quando usuário acessa `/mensagens`, então ele NÃO aparece na listagem
- **CA-06** (RF-05): Dado visitante com 2 templates enviados de 4 ativos, quando abre detalhe, então stepper mostra 2 concluídos e 2 pendentes
- **CA-07** (RF-06): Dado visitante sem nenhuma mensagem enviada, então `nextTemplate` retorna o template de menor `order` ativo
- **CA-08** (RF-07): Dado usuário com `MENSAGENS_ENVIAR`, quando clica "Enviar próxima mensagem", então diálogo exibe título, corpo processado e telefone formatado
- **CA-09** (RF-08): Dado usuário confirma no diálogo, quando `POST /api/visitantes/[id]/mensagens` retorna 201, então WhatsApp Web abre em nova aba com a mensagem codificada
- **CA-10** (RF-09): Dado usuário sem `MENSAGENS_GERENCIAR` nem `MENSAGENS_ENVIAR`, quando acessa home de visitantes, então card "Mensagens" não aparece
- **CA-11** (RF-10): Dado admin acessa gerenciamento de permissões de um usuário, então vê `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR` disponíveis para atribuição

## 13. Riscos e Decisoes em Aberto

- **Decisão**: Snapshot do corpo no log é o texto processado (nome substituído) — garante histórico fiel independente de edições futuras no template
- **Decisão**: `messageTemplateId` em `MemberMessageLog` é nullable — permite que o template seja hard-deleted sem perder o log histórico (somente ocorre se já não há logs, então na prática o nullable é para soft-delete pós-envio)
- **Decisão**: WhatsApp Web URL com prefixo `55` (DDI Brasil) fixo — internacionalização fora de escopo desta SPEC
- **Decisão**: Abertura do WhatsApp ocorre após o 201 do backend — garante que o log foi criado antes de abrir o app
- **Risco**: Visitante sem telefone cadastrado — botão "Enviar próxima mensagem" deve estar desabilitado ou exibir aviso se `Member.phone` for null/empty
- **Risco**: Prisma `$transaction` com múltiplas escritas — verificar performance; esperado ser rápido para o volume do sistema
- **Risco**: SPEC 008 inclui exclusão de `MemberMessageLog` quando visitante é excluído — o service de delete de visitante (SPEC 008) deve ser atualizado em SPEC 009 para incluir a limpeza de logs de mensagens, ou a SPEC 009 deve fazer esse ajuste

## 14. Plano de Implementacao (ordem)

1. Atualizar `prisma/schema.prisma` com `MessageTemplate` e `MemberMessageLog`
2. `npx prisma migrate dev --name add-message-templates-and-logs`
3. `npx prisma generate`
4. Reiniciar `next dev`
5. Adicionar `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR` em `permissions.ts`
6. Criar schemas Zod de mensagem
7. Criar repositories do módulo `mensagens`
8. Criar services do módulo `mensagens`
9. Criar controllers `api/mensagens/` (GET + POST + PUT + DELETE)
10. Criar repositories de visitante/mensagens
11. Criar services de visitante/mensagens
12. Criar controller `api/visitantes/[id]/mensagens/`
13. Criar `visitante-mensagens-stepper.tsx` e `enviar-mensagem-dialog.tsx`
14. Integrar stepper e botão no componente de detalhe do visitante
15. Criar `mensagens-page-view.tsx` e `message-template-form.tsx`
16. Criar `/mensagens/page.tsx` (Server Component com guard)
17. Adicionar card "Mensagens" em `visitantes-home-view.tsx`
18. Atualizar service de delete de visitante para incluir limpeza de `MemberMessageLog`
19. Escrever testes
20. `npx vitest run` — sem falhas
21. Lint sem erro

## 15. Estrategia de Testes

- **Schema** `message-template.schema.ts`: valida campos obrigatórios, min/max de título e corpo
- **Service** `delete-message-template`: testa hard delete (sem logs), soft delete (com logs)
- **Service** `log-mensagem-visitante`: substitui `{nome_do_usuario}`, cria snapshot correto, falha se não há próxima mensagem
- **Service** `get-visitante-mensagens`: retorna templates ativos, identifica corretamente `nextTemplate`
- **Controller** `api/mensagens/route.ts`: GET (200 lista), POST (201 criado, 400 inválido, 403 sem permissão)
- **Controller** `api/mensagens/[id]/route.ts`: DELETE (200 hard, 200 soft, 403, 404)
- **Controller** `api/visitantes/[id]/mensagens/route.ts`: GET (200 com stepper data), POST (201 log criado, 403 sem envio)
- **UI** `visitante-mensagens-stepper`: renderiza passos, marca concluídos, exibe próximo pendente
- **UI** `mensagens-page-view`: renderiza lista, botão adicionar, opções de editar/excluir

## Status de Execucao

- Estado: `Backlog`
- Responsavel: `<definir>`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [ ] Schema criado/atualizado
- [ ] Repository criado/atualizado
- [ ] Service criado/atualizado
- [ ] Controller/route criado/atualizado
- [ ] UI criada/atualizada (quando aplicavel)
- [ ] Migration criada (quando aplicavel)
- [ ] `npx prisma generate` executado (quando aplicavel)
- [ ] Testes adicionados/atualizados
- [ ] Testes passando
- [ ] Lint sem erro
- [ ] Criterios de aceite validados
