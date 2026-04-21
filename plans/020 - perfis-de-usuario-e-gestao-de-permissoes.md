# SPEC 020 - Perfis de Usuário e Gestão Unificada de Permissões

## 1. Contexto

Atualmente, permissões são atribuídas individualmente a cada usuário via `UserPermission`. O processo é manual e repetitivo: para dar o mesmo conjunto de permissões a dez usuários, é necessário repetir o processo dez vezes.

Esta SPEC introduz o conceito de **perfil de usuário**: um conjunto nomeado de permissões que pode ser criado pelo MASTER e atribuído a múltiplos usuários. A atribuição de um perfil a um usuário concede suas permissões automaticamente; a remoção revoga apenas as permissões que não vêm de outro perfil ou de uma adição individual.

A gestão individual de permissões é mantida — perfis são um facilitador, não um substituto.

**Pré-requisito:** SPEC 019 (Role MASTER) deve estar concluída antes desta entrega.

---

## 2. Objetivo de Negócio

Reduzir o esforço operacional de gestão de permissões ao permitir que o MASTER defina perfis reutilizáveis. Ao mesmo tempo, preservar a flexibilidade de ajustes individuais por usuário.

---

## 3. Escopo

### 3.1 Em escopo

- Novo model `UserProfile` com nome e lista de permissões
- Novo model `UserProfileAssignment` — junção usuário ↔ perfil
- Novo model `UserManualPermission` — permissões adicionadas individualmente ao usuário
- `UserPermission` passa a ser a **view materializada** das permissões efetivas (union de perfis + manuais)
- Migration de dados: copiar `UserPermission` existente para `UserManualPermission`
- CRUD completo de perfis (MASTER only): criar, listar, buscar, editar, excluir
- Excluir perfil: recomputa permissões de todos os usuários afetados
- API para buscar permissões de um usuário: retorna perfis atribuídos + permissões manuais (separados)
- API para salvar permissões de um usuário: recebe `{ profileIds, permissions }`, salva assignments + manuais + recomputa efetivo
- UI: nova página `/admin/perfis` (lista, criação, edição) — MASTER only
- UI: página de detalhes de usuário com duas abas: "Dados" e "Permissões"
- UI: página de edição de usuário com duas abas: "Dados" e "Permissões"
- UI: aba de Permissões exibe perfis atribuídos e permissões individuais (com seções distintas)
- Proteção de rotas: `/admin/perfis` acessível apenas por MASTER

### 3.2 Fora de escopo

- Heredariedade de perfis (perfil que herda de outro)
- Permissões exclusivas de perfil (todas as permissões do sistema são reutilizáveis em qualquer perfil)
- Auditoria de quem atribuiu qual perfil
- Perfis globais/sistema (todos os perfis são criados pelo MASTER, não existem perfis built-in)
- Sugestão automática de perfil baseada em permissões já atribuídas

---

## 4. Requisitos Funcionais

- **RF-01** — MASTER pode criar um perfil com nome único e selecionar quaisquer permissões do sistema
- **RF-02** — MASTER pode editar nome e permissões de um perfil existente; ao editar, as permissões efetivas de todos os usuários com o perfil são recomputadas
- **RF-03** — MASTER pode excluir um perfil; ao excluir, as permissões efetivas de todos os usuários que tinham o perfil são recomputadas (permissões que existem em outros perfis ou foram adicionadas individualmente são preservadas)
- **RF-04** — ADMIN e MASTER podem atribuir e desatribuir perfis a usuários durante a gestão de permissões
- **RF-05** — ADMIN e MASTER podem adicionar e remover permissões individuais de um usuário (independentes de perfis)
- **RF-06** — A permissão efetiva de um usuário = union(permissões de todos os perfis atribuídos) ∪ permissões manuais
- **RF-07** — Ao remover um perfil de um usuário, somente as permissões que **não aparecem em nenhum outro perfil atribuído** e **não foram adicionadas individualmente** são removidas
- **RF-08** — A tabela `user_permissions` (materializada) é sempre a fonte usada pelo sistema de autenticação — sem mudança no contrato de sessão
- **RF-09** — A tela de gerenciamento de perfis mostra: nome do perfil, quantidade de permissões, quantidade de usuários com o perfil
- **RF-10** — Aba "Permissões" na tela de **detalhes** do usuário apresenta dois quadrantes (read-only):
  - **Quadrante superior — Perfis**: lista dos perfis atribuídos ao usuário (nome + quantidade de permissões de cada perfil)
  - **Quadrante inferior — Permissões individuais**: checkboxes agrupados por módulo, marcados para cada permissão efetiva do usuário, com indicação visual de quais vêm de perfil vs. foram adicionadas manualmente
- **RF-11** — Aba "Permissões" na tela de **edição** do usuário apresenta dois quadrantes interativos:
  - **Quadrante superior — Perfis**: lista de perfis disponíveis no sistema; o gestor pode marcar/desmarcar quais estão atribuídos ao usuário; ao marcar um perfil, as permissões desse perfil são automaticamente marcadas no quadrante inferior
  - **Quadrante inferior — Permissões individuais**: checkboxes agrupados por módulo; permissões que vêm de um perfil atribuído aparecem marcadas e desabilitadas (não editáveis individualmente enquanto o perfil estiver ativo); permissões sem cobertura de perfil são editáveis; desmarcar um perfil desmarca automaticamente as permissões que eram exclusivas daquele perfil
  - Botão "Salvar Permissões" independente, chama `PATCH /api/usuarios/[id]/permissoes`
- **RF-12** — Nome de perfil deve ser único no sistema
- **RF-13** — STAFF não acessa `/admin/perfis` (redirecionado para `/`)
- **RF-14** — ADMIN não acessa `/admin/perfis` (rota é exclusiva de MASTER)

---

## 5. Requisitos Não Funcionais

- **RNF-01** — Recompute de permissões ocorre em transação Prisma para garantir consistência (substituição atômica de `user_permissions`)
- **RNF-02** — O contrato de sessão não muda: `session.permissions` continua sendo lido de `user_permissions` (materializado) — nenhuma mudança em `auth.ts` ou no formato do token
- **RNF-03** — A migration de dados existentes (cópia de `user_permissions` → `user_manual_permissions`) deve ser incluída na migration SQL
- **RNF-04** — Excluir perfil com muitos usuários: recompute em batch dentro de uma transaction, ou em múltiplas transactions se o número de usuários for alto (documentar decisão na SPEC antes de implementar)
- **RNF-05** — TypeScript sem `any`
- **RNF-06** — Perfil com 0 permissões é válido (perfil vazio pode ser criado/editado)

---

## 6. Modelagem de Dados

### 6.1 Novos models

```prisma
model UserProfile {
  id          String   @id @default(cuid())
  nome        String   @unique
  permissions String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  assignments UserProfileAssignment[]

  @@map("user_profiles")
}

model UserProfileAssignment {
  userId     String
  profileId  String
  assignedAt DateTime @default(now())

  user    User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  profile UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@id([userId, profileId])
  @@map("user_profile_assignments")
}

model UserManualPermission {
  userId     String
  permission String
  grantedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, permission])
  @@map("user_manual_permissions")
}
```

### 6.2 Model existente — sem mudança estrutural

```prisma
model UserPermission {
  // sem alteração de schema
  // passa a ser a view materializada do efetivo
  // (union de perfis + manuais)
  userId     String
  permission String
  grantedAt  DateTime @default(now())
  user User @relation(...)
  @@id([userId, permission])
  @@map("user_permissions")
}
```

### 6.3 Migration de dados

A migration SQL deve incluir:

```sql
-- Copia permissões existentes para a nova tabela de permissões manuais
INSERT INTO user_manual_permissions (user_id, permission, granted_at)
SELECT user_id, permission, granted_at FROM user_permissions;
```

Isso garante que todos os usuários existentes mantêm suas permissões como "manuais" até que perfis sejam atribuídos.

### 6.4 Relação adicionada ao model `User`

```prisma
model User {
  // ... campos existentes ...
  profileAssignments   UserProfileAssignment[]
  manualPermissions    UserManualPermission[]
}
```

### 6.5 `onDelete: Cascade` mapeado

| Relação | Comportamento |
|---|---|
| `UserProfileAssignment.user` | `onDelete: Cascade` — remoção do usuário remove seus assignments |
| `UserProfileAssignment.profile` | `onDelete: Cascade` — remoção do perfil remove seus assignments (banco garante) |
| `UserManualPermission.user` | `onDelete: Cascade` — remoção do usuário remove suas permissões manuais |

> Quando um perfil é excluído, o banco remove os `UserProfileAssignment` automaticamente via cascade. O service deve, **antes de excluir o perfil**, coletar os `userId` afetados para recomputar seus `user_permissions` após a exclusão.

---

## 7. Fluxos Funcionais

### 7.1 Criar perfil

```
POST /api/perfis
  ↓
requireMasterSessionForApi()
  ↓
createPerfilSchema.safeParse(body)
  ↓
createPerfilService({ nome, permissions })
  ↓
verifica nome único → createPerfilRepository(data)
  ↓
Retorna { success: true, perfil }
```

### 7.2 Salvar permissões de um usuário (novo contrato)

```
PATCH /api/usuarios/[id]/permissoes
  ↓
requireAdminSessionForApi()
  ↓
updateUserPermissionsSchema.safeParse(body)  // { profileIds: string[], permissions: PermissionKey[] }
  ↓
updateUserPermissionsService({ userId, profileIds, manualPermissions })
  ↓
Em transação:
  1. Substituir UserProfileAssignment do usuário pelos profileIds recebidos
  2. Substituir UserManualPermission do usuário pelas permissions recebidas
  3. Recomputar e substituir UserPermission (materializado):
     effective = union(permissions de todos os perfis) ∪ manualPermissions
  ↓
Retorna { success: true }
```

### 7.3 Carregar permissões de um usuário (novo payload)

```
GET /api/usuarios/[id]/permissoes
  ↓
requireAdminSessionForApi()
  ↓
loadUserPermissionsService(userId)
  ↓
Busca em paralelo:
  - perfis atribuídos (UserProfileAssignment + UserProfile)
  - permissões manuais (UserManualPermission)
  ↓
Retorna {
  assignedProfiles: { id, nome, permissions }[],
  manualPermissions: PermissionKey[]
}
```

### 7.4 Excluir perfil

```
DELETE /api/perfis/[id]
  ↓
requireMasterSessionForApi()
  ↓
deletePerfilService(profileId)
  ↓
1. Busca userId de todos os usuários com o perfil (UserProfileAssignment)
2. Em transação:
   a. Delete UserProfile (cascade remove UserProfileAssignment)
   b. Para cada userId afetado: recompute UserPermission
  ↓
Retorna { success: true }
```

### 7.5 Editar perfil

```
PATCH /api/perfis/[id]
  ↓
requireMasterSessionForApi()
  ↓
updatePerfilSchema.safeParse(body)  // { nome?, permissions? }
  ↓
updatePerfilService(profileId, data)
  ↓
1. Busca userId de todos os usuários com o perfil
2. Atualiza UserProfile
3. Para cada userId afetado: recompute UserPermission
  ↓
Retorna { success: true, perfil }
```

---

## 8. Contratos de Camadas (Arquitetura)

### Módulo `src/modules/perfis/` (novo)

#### Schemas

| Arquivo | Contrato |
|---|---|
| `create-perfil.schema.ts` | `{ nome: string, permissions: PermissionKey[] }` |
| `update-perfil.schema.ts` | `{ nome?: string, permissions?: PermissionKey[] }` (partial) |

#### Services

| Arquivo | Responsabilidade |
|---|---|
| `create-perfil.service.ts` | Valida nome único, cria perfil |
| `update-perfil.service.ts` | Atualiza perfil, recomputa permissions dos usuários afetados |
| `delete-perfil.service.ts` | Coleta usuários afetados, deleta, recomputa |
| `list-perfis.service.ts` | Lista todos os perfis com contagem de usuários |
| `get-perfil.service.ts` | Busca perfil por ID |

#### Repositories

| Arquivo | Responsabilidade |
|---|---|
| `create-perfil.repository.ts` | `prisma.userProfile.create(...)` |
| `update-perfil.repository.ts` | `prisma.userProfile.update(...)` |
| `delete-perfil.repository.ts` | `prisma.userProfile.delete(...)` |
| `list-perfis.repository.ts` | `prisma.userProfile.findMany(...)` com contagens |
| `find-perfil-by-id.repository.ts` | `prisma.userProfile.findUnique(...)` |
| `find-users-by-profile.repository.ts` | Retorna userIds que têm o perfil atribuído |

### Módulo `src/modules/usuarios/` — arquivos atualizados

#### `update-user-permissions.service.ts`

Nova assinatura:
```ts
updateUserPermissionsService({
  userId: string,
  profileIds: string[],
  manualPermissions: PermissionKey[],
  db?: RepositoryClient
})
```

#### `load-user-permissions.service.ts`

Nova resposta:
```ts
{
  assignedProfiles: { id: string, nome: string, permissions: string[] }[],
  manualPermissions: PermissionKey[]
}
```

#### Novos repositories em `src/modules/usuarios/repositories/`

| Arquivo | Responsabilidade |
|---|---|
| `replace-user-profile-assignments.repository.ts` | Substitui todos os assignments do usuário |
| `replace-user-manual-permissions.repository.ts` | Substitui todas as permissões manuais do usuário |
| `recompute-user-permissions.repository.ts` | Calcula efetivo e substitui `user_permissions` (recebe `db` para transação) |
| `find-user-profile-assignments.repository.ts` | Busca perfis atribuídos ao usuário com detalhes do perfil |
| `find-user-manual-permissions.repository.ts` | Busca permissões manuais do usuário |

#### Schema `update-user-permissions.schema.ts` — atualizado

```ts
z.object({
  profileIds: z.array(z.string()),
  permissions: z.array(z.enum(PERMISSIONS))
})
```

---

## 9. Endpoints

### Novos endpoints — Perfis (MASTER only)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/perfis` | MASTER | Listar perfis |
| `POST` | `/api/perfis` | MASTER | Criar perfil |
| `GET` | `/api/perfis/[id]` | MASTER | Buscar perfil |
| `PATCH` | `/api/perfis/[id]` | MASTER | Editar perfil |
| `DELETE` | `/api/perfis/[id]` | MASTER | Excluir perfil |

### Endpoints existentes alterados

| Método | Rota | Mudança |
|---|---|---|
| `GET` | `/api/usuarios/[id]/permissoes` | Resposta agora retorna `{ assignedProfiles, manualPermissions }` (em vez de `{ permissions }`) |
| `PATCH` | `/api/usuarios/[id]/permissoes` | Body agora aceita `{ profileIds, permissions }` (em vez de `{ permissions }` flat) |

> **Atenção breaking change**: a mudança no contrato de `/api/usuarios/[id]/permissoes` (GET e PATCH) quebra o frontend existente. O frontend de permissões deve ser atualizado no mesmo PR desta SPEC.

---

## 10. Estrutura de Arquivos (proposta)

```
prisma/
  schema.prisma                                            → ALTERAR
  migrations/<timestamp>_add-user-profiles/               → CRIAR (inclui migration de dados)

src/modules/perfis/                                        → CRIAR (novo módulo)
  schemas/
    create-perfil.schema.ts
    update-perfil.schema.ts
  services/
    create-perfil.service.ts
    update-perfil.service.ts
    delete-perfil.service.ts
    list-perfis.service.ts
    get-perfil.service.ts
  repositories/
    create-perfil.repository.ts
    update-perfil.repository.ts
    delete-perfil.repository.ts
    list-perfis.repository.ts
    find-perfil-by-id.repository.ts
    find-users-by-profile.repository.ts
  types/
    perfil.type.ts

src/modules/usuarios/
  schemas/
    update-user-permissions.schema.ts                      → ALTERAR
  services/
    update-user-permissions.service.ts                     → ALTERAR
    load-user-permissions.service.ts                       → ALTERAR
  repositories/
    replace-user-profile-assignments.repository.ts         → CRIAR
    replace-user-manual-permissions.repository.ts          → CRIAR
    recompute-user-permissions.repository.ts               → CRIAR
    find-user-profile-assignments.repository.ts            → CRIAR
    find-user-manual-permissions.repository.ts             → CRIAR

src/app/api/perfis/
  route.ts                                                 → CRIAR (GET list + POST create)
  [id]/route.ts                                            → CRIAR (GET + PATCH + DELETE)

src/app/(web_pages)/(private)/admin/
  perfis/
    page.tsx                                               → CRIAR (listagem — MASTER only)
    novo/page.tsx                                          → CRIAR (criação — MASTER only)
    [id]/editar/page.tsx                                   → CRIAR (edição — MASTER only)

src/frontend/features/perfis/                              → CRIAR (novo)
  components/
    perfis-list-view.tsx
    perfil-form-view.tsx

src/frontend/features/usuarios/
  components/
    usuario-detail.tsx                                     → ALTERAR (adicionar abas)
    usuario-form.tsx                                       → ALTERAR (adicionar abas)
    user-permissions-form.tsx                              → ALTERAR (perfis + permissões manuais)
    user-profiles-section.tsx                              → CRIAR (seção de perfis atribuídos)
```

---

## 11. Regras de Validação

- **RV-01** — `create-perfil.schema.ts`: `nome` obrigatório, string não vazia; `permissions` array de `PermissionKey` válidas
- **RV-02** — `update-perfil.schema.ts`: ambos os campos opcionais; ao menos um deve estar presente
- **RV-03** — Service `create-perfil`: rejeitar com `AppError(400, "NOME_JA_EXISTE")` se já existe perfil com o mesmo nome
- **RV-04** — Service `update-perfil`: rejeitar com `AppError(400, "NOME_JA_EXISTE")` se nome novo já pertence a outro perfil
- **RV-05** — Service `delete-perfil`: rejeitar com `AppError(404, "PERFIL_NAO_ENCONTRADO")` se perfil não existe
- **RV-06** — `update-user-permissions.schema.ts`: `profileIds` array de strings; `permissions` array de `PermissionKey` válidas; ambos obrigatórios (podem ser vazios `[]`)
- **RV-07** — Service `update-user-permissions`: verificar que cada `profileId` existe no banco antes de salvar
- **RV-08** — Permissões no array `UserProfile.permissions` devem ser valores do enum `PermissionKey` (validação no schema Zod; no banco é `String[]` sem constraint)

---

## 12. Critérios de Aceite

- **CA-01 (RF-01)** — Dado MASTER logado, quando cria perfil com nome "Equipe Padrão" e 3 permissões, então perfil é salvo com `id` gerado
- **CA-02 (RF-01)** — Dado MASTER logado, quando tenta criar perfil com nome duplicado, então recebe 400 com código `NOME_JA_EXISTE`
- **CA-03 (RF-14)** — Dado ADMIN logado, quando acessa `GET /api/perfis`, então recebe 403
- **CA-04 (RF-02)** — Dado MASTER logado, quando edita permissões de um perfil, então as permissões efetivas de todos os usuários com aquele perfil são recomputadas
- **CA-05 (RF-03)** — Dado MASTER logado, quando exclui um perfil, então usuários que tinham o perfil têm suas permissões recomputadas, preservando permissões que vêm de outros perfis ou foram adicionadas individualmente
- **CA-06 (RF-06/07)** — Dado usuário com perfil A (permissões: X, Y) e permissão manual Z, quando perfil A é removido, então o usuário fica com permissão efetiva apenas Z
- **CA-07 (RF-06/07)** — Dado usuário com perfil A (X, Y) e perfil B (Y, W), quando perfil A é removido, então o usuário fica com permissão efetiva Y e W (Y mantida porque vem de B)
- **CA-08 (RF-08)** — A tabela `user_permissions` sempre reflete o estado computado; o endpoint `/api/usuarios/[id]/permissoes` GET retorna a estrutura `{ assignedProfiles, manualPermissions }`
- **CA-09 (RF-10)** — Na tela de detalhes do usuário, a aba "Permissões" exibe dois quadrantes: superior com os perfis atribuídos e inferior com os checkboxes de permissões individuais marcados conforme o efetivo do usuário (read-only)
- **CA-10 (RF-11)** — Na tela de edição do usuário, a aba "Permissões" exibe dois quadrantes interativos: ao marcar um perfil no quadrante superior, as permissões desse perfil são automaticamente marcadas e desabilitadas no quadrante inferior; ao desmarcar o perfil, as permissões exclusivas dele são desmarcadas; o botão "Salvar Permissões" envia `{ profileIds, permissions }` para o endpoint
- **CA-11 (RF-12)** — Nome de perfil é único no sistema (constraint no banco: `@@unique` em `nome`)
- **CA-12 (RF-09)** — A listagem de perfis exibe nome, quantidade de permissões e quantidade de usuários com aquele perfil
- **CA-13 (RF-13/14)** — STAFF e ADMIN redirecionados para `/` ao acessar `/admin/perfis`

---

## 13. Riscos e Decisões em Aberto

| ID | Risco / Decisão | Status |
|---|---|---|
| D-01 | `UserPermission` como view materializada: decisão tomada — mantém contrato de sessão intacto e performance de auth | Decidido |
| D-02 | Migration de dados existentes: copiar `user_permissions` → `user_manual_permissions` na própria migration | Decidido |
| D-03 | Permissões do perfil armazenadas como `String[]` (PostgreSQL native array): decisão tomada por simplicidade vs. junction table | Decidido |
| D-04 | Recompute de permissões ao excluir/editar perfil com muitos usuários: definir limite antes de implementar — se > N usuários, usar loop de transactions; se ≤ N, transaction única | Aberto — definir N |
| D-05 | ADMIN pode atribuir perfis a usuários (não só criar perfis): decidido — ADMIN gerencia assignments, MASTER gerencia o catálogo de perfis | Decidido |
| D-06 | Breaking change no contrato de `/api/usuarios/[id]/permissoes`: frontend deve ser atualizado no mesmo PR | Decidido — implementação deve cobrir backend e frontend juntos |
| D-07 | Comportamento ao editar permissões de um perfil que é o único fonte de uma permissão em um usuário: a permissão é removida do usuário se não estiver em outro perfil nem for manual | Decidido |
| R-01 | Recompute em transação pode ser lento para usuários com muitos perfis; monitorar em staging | Risco baixo |
| R-02 | Diferenciação visual entre permissões de perfil e manuais: permissões de perfil ficam marcadas e desabilitadas (não editáveis enquanto o perfil estiver ativo); permissões sem cobertura de perfil ficam habilitadas para edição individual | Decidido |

---

## 14. Plano de Implementação (ordem)

1. **Banco** — Atualizar `prisma/schema.prisma` (3 novos models + relações em User), criar migration (incluindo SQL de cópia de dados), executar `npx prisma generate`
2. **Repositories de perfis** — Criar todos os repositories em `src/modules/perfis/repositories/`
3. **Services de perfis** — Criar `create`, `update`, `delete`, `list`, `get` em `src/modules/perfis/services/`
4. **Schemas de perfis** — Criar `create-perfil.schema.ts` e `update-perfil.schema.ts`
5. **Controllers de perfis** — Criar `src/app/api/perfis/route.ts` e `[id]/route.ts`
6. **Repositories de usuários (novos)** — Criar `replace-user-profile-assignments`, `replace-user-manual-permissions`, `recompute-user-permissions`, `find-user-profile-assignments`, `find-user-manual-permissions`
7. **Services de usuários (atualizados)** — Atualizar `update-user-permissions.service.ts` e `load-user-permissions.service.ts`
8. **Schema de usuários (atualizado)** — Atualizar `update-user-permissions.schema.ts`
9. **Controller de permissões (atualizado)** — Atualizar `src/app/api/usuarios/[id]/permissoes/route.ts`
10. **Frontend — perfis** — Criar `perfis-list-view.tsx`, `perfil-form-view.tsx`; criar pages em `/admin/perfis/`
11. **Frontend — usuários (abas)** — Atualizar `usuario-detail.tsx` e `usuario-form.tsx` com abas MUI Tabs
12. **Frontend — permissões (atualizado)** — Atualizar `user-permissions-form.tsx` para suportar perfis + manuais; criar `user-profiles-section.tsx`
13. **Navegação** — Adicionar link "Perfis de Usuário" na sidebar/menu (visível apenas para MASTER)
14. **Lint + build** — Validar sem erros

---

## 15. Estratégia de Testes

Não se aplica nesta entrega por decisão explícita do solicitante. Testes serão cobertos em fase subsequente.

---

## Status de Execução

- Estado: `Backlog`
- Responsável: `<definir>`
- Última atualização: `2026-04-21`

### Checklist de Entrega

- [ ] Schema criado/atualizado
- [ ] Repository criado/atualizado
- [ ] Service criado/atualizado
- [ ] Controller/route criado/atualizado
- [ ] UI criada/atualizada (quando aplicável)
- [ ] Migration criada (quando aplicável)
- [ ] `npx prisma generate` executado (quando aplicável)
- [ ] Testes adicionados/atualizados
- [ ] Testes passando
- [ ] Lint sem erro
- [ ] Critérios de aceite validados
