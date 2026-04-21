# SPEC 019 - Role MASTER e Hierarquia de Acesso

## 1. Contexto

O sistema atualmente possui dois níveis de acesso: `ADMIN` e `STAFF`. Com o crescimento do sistema, surge a necessidade de um terceiro nível — `MASTER` — que representa o super-usuário com acesso irrestrito a todo o sistema, incluindo a gestão de perfis de usuário (SPEC 020) e a capacidade de gerenciar outros administradores sem restrições.

A introdução da role MASTER também exige a revisão dos guards de acesso, das traduções de roles na UI e das regras de quem pode editar/excluir quem.

Esta SPEC é **pré-requisito** para SPEC 020 (Perfis de Usuário).

---

## 2. Objetivo de Negócio

Permitir que usuários com nível MASTER tenham acesso irrestrito ao sistema, enquanto ADMIN continua gerenciando usuários e permissões com a restrição de não poder tocar em usuários MASTER. STAFF permanece sem acesso à gestão de usuários ou perfis.

---

## 3. Escopo

### 3.1 Em escopo

- Adicionar `MASTER` ao enum `Role` no schema Prisma
- Atualizar `SessionRole` em `src/lib/auth.ts` para incluir `MASTER`
- Atualizar `requireAdminSession()` e `requireAdminSessionForApi()` para aceitar MASTER e ADMIN (nível admin-ou-acima)
- Criar `requireMasterSession()` e `requireMasterSessionForApi()` (exclusivo para MASTER)
- Atualizar `hasPermission()` para que MASTER também bypass todas as permissões
- Atualizar serviços de CRUD de usuário para impedir que ADMIN edite/exclua usuários MASTER
- Atualizar serviço de convite para restringir roles permitidas por quem convida
- Atualizar Zod schemas de role para incluir MASTER
- Adicionar traduções de role: `STAFF` → "Equipe", `ADMIN` → "Administrador", `MASTER` → "Master"
- Atualizar UI: ocultar navegação de usuários para STAFF
- Atualizar UI: desabilitar ações de editar/excluir em usuários MASTER quando logado como ADMIN
- Atualizar UI: exibir role "Master" no form de convite somente para MASTER
- Migration de banco para adicionar o valor MASTER ao enum

### 3.2 Fora de escopo

- Criação de perfis de usuário (SPEC 020)
- Qualquer mudança nas permissões granulares (SPEC 020)
- Criação de usuário MASTER via interface (feito via convite ou seed)
- Auditoria/log de ações por role

---

## 4. Requisitos Funcionais

- **RF-01** — A role MASTER deve existir no banco (enum `Role`) e no sistema de sessão
- **RF-02** — MASTER tem acesso irrestrito: todos os guards de nível admin passam para MASTER, e `hasPermission()` retorna `true` para qualquer permissão
- **RF-03** — `requireAdminSession()` e `requireAdminSessionForApi()` devem aceitar `ADMIN` **e** `MASTER` (nível ≥ admin)
- **RF-04** — `requireMasterSession()` e `requireMasterSessionForApi()` devem aceitar **somente** `MASTER`
- **RF-05** — ADMIN não pode editar nem excluir usuários com role MASTER (service deve rejeitar com `AppError`)
- **RF-06** — ADMIN não pode criar convite com role MASTER; apenas MASTER pode criar convite para role MASTER
- **RF-07** — STAFF não tem acesso às rotas `/admin/usuarios` e `/admin/perfis`; ao tentar acessar, é redirecionado para `/`
- **RF-08** — Traduções de role na UI: `STAFF` → "Equipe", `ADMIN` → "Administrador", `MASTER` → "Master"
- **RF-09** — No formulário de geração de convite, a opção de role MASTER só é exibida quando o usuário logado é MASTER
- **RF-10** — Na tabela e detalhes de usuários, a role é exibida com a tradução (não o valor enum bruto)
- **RF-11** — MASTER pode ver e editar usuários de qualquer role (incluindo outros MASTER)

---

## 5. Requisitos Não Funcionais

- **RNF-01** — Tokens de sessão existentes (com `role: "ADMIN"` ou `role: "STAFF"`) continuam válidos sem migração — apenas um novo valor válido é adicionado ao tipo
- **RNF-02** — Nenhuma query de banco adicional para verificar role nas rotas já existentes; a role vem da sessão já carregada
- **RNF-03** — TypeScript sem `any`; o tipo `SessionRole` deve ser `"ADMIN" | "STAFF" | "MASTER"` em todos os pontos

---

## 6. Modelagem de Dados

### Mudança no schema Prisma

```prisma
enum Role {
  ADMIN
  STAFF
  MASTER  // novo valor
}
```

O enum `Role` também é usado em `UserInvite.role`. Ambos os usos aceitam o novo valor.

### Migration

```bash
npx prisma migrate dev --name add-role-master
```

SQL gerado pelo Prisma para PostgreSQL:
```sql
ALTER TYPE "Role" ADD VALUE 'MASTER';
```

> Atenção: `ALTER TYPE ... ADD VALUE` não é transacional em PostgreSQL. Deve ser a única operação na migration.

---

## 7. Fluxos Funcionais

### 7.1 Guard de acesso — nível admin-ou-acima

```
Request chega em rota protegida
  ↓
requireAdminSessionForApi() / requireAdminSession()
  ↓
Verifica token e usuário ativo
  ↓
role === "ADMIN" ou role === "MASTER"? → Passa
role === "STAFF"? → 403 / redirect "/"
```

### 7.2 Guard de acesso — somente MASTER

```
Request chega em rota de perfis
  ↓
requireMasterSessionForApi() / requireMasterSession()
  ↓
Verifica token e usuário ativo
  ↓
role === "MASTER"? → Passa
role !== "MASTER"? → 403 / redirect "/"
```

### 7.3 ADMIN tenta editar usuário MASTER

```
PATCH /api/usuarios/[id]
  ↓
requireAdminSessionForApi() → retorna sessão (ADMIN passa)
  ↓
updateUsuarioService(id, data, session)
  ↓
busca usuário alvo no banco
  ↓
alvo.role === "MASTER" e session.role !== "MASTER"? → AppError(403, "FORBIDDEN")
  ↓
continua atualização normalmente
```

### 7.4 Convite com role MASTER

```
POST /api/usuarios/convites
  ↓
requireAdminSessionForApi() → passa para ADMIN e MASTER
  ↓
generateUserInviteService(data, session)
  ↓
data.role === "MASTER" e session.role !== "MASTER"? → AppError(403, "FORBIDDEN")
  ↓
gera convite normalmente
```

---

## 8. Contratos de Camadas (Arquitetura)

### `src/lib/auth.ts`

Alterar `SessionRole`:
```ts
type SessionRole = "ADMIN" | "STAFF" | "MASTER"
```

### `src/lib/require-admin-session.ts`

Alterar verificação de role:
```ts
// antes:
if (currentUser.role !== "ADMIN") { ... }

// depois:
if (currentUser.role !== "ADMIN" && currentUser.role !== "MASTER") { ... }
```

Aplicar tanto em `requireAdminSession()` quanto em `requireAdminSessionForApi()`.

### `src/lib/require-master-session.ts` (novo arquivo)

```ts
export async function requireMasterSession(): Promise<SessionPayload>
export async function requireMasterSessionForApi(): Promise<SessionPayload>
```

Lógica: idêntica ao `require-admin-session.ts`, mas verifica `role === "MASTER"` exclusivamente.

### `src/shared/utils/require-permission.ts`

```ts
// antes:
if (session.role === "ADMIN") return true;

// depois:
if (session.role === "ADMIN" || session.role === "MASTER") return true;
```

### `src/modules/usuarios/services/update-usuario.service.ts`

Adicionar validação antes de persistir:
```ts
if (targetUser.role === "MASTER" && session.role !== "MASTER") {
  throw new AppError("Sem permissão para editar usuário Master", 403, "FORBIDDEN")
}
```

### `src/modules/usuarios/services/soft-delete-usuario.service.ts`

Adicionar validação:
```ts
if (targetUser.role === "MASTER" && session.role !== "MASTER") {
  throw new AppError("Sem permissão para excluir usuário Master", 403, "FORBIDDEN")
}
```

### `src/modules/usuarios/services/generate-user-invite.service.ts`

Adicionar validação:
```ts
if (data.role === "MASTER" && session.role !== "MASTER") {
  throw new AppError("Sem permissão para convidar usuário Master", 403, "FORBIDDEN")
}
```

### `src/modules/usuarios/schemas/generate-user-invite.schema.ts`

```ts
// antes:
role: z.enum(["ADMIN", "STAFF"])

// depois:
role: z.enum(["ADMIN", "STAFF", "MASTER"])
```

> A restrição de quem pode convidar MASTER é validada no service, não no schema.

### `src/modules/usuarios/schemas/update-usuario.schema.ts`

```ts
role: z.enum(["ADMIN", "STAFF", "MASTER"])
```

### `src/modules/usuarios/types/usuario.type.ts`

```ts
export type UsuarioRole = "ADMIN" | "STAFF" | "MASTER"
```

### `src/modules/usuarios/types/user-invite.type.ts`

```ts
export type UserInviteRole = "ADMIN" | "STAFF" | "MASTER"
```

### `src/shared/constants/role-translations.ts` (novo arquivo)

```ts
export const ROLE_TRANSLATIONS: Record<"ADMIN" | "STAFF" | "MASTER", string> = {
  ADMIN: "Administrador",
  STAFF: "Equipe",
  MASTER: "Master",
}
```

---

## 9. Endpoints

Nenhum novo endpoint nesta SPEC. Apenas mudanças internas nos guards e services existentes.

| Rota | Mudança |
|---|---|
| `GET /api/usuarios` | `requireAdminSessionForApi()` passa a aceitar MASTER (automático) |
| `GET /api/usuarios/[id]` | idem |
| `PATCH /api/usuarios/[id]` | service rejeita edição de MASTER por não-MASTER |
| `DELETE /api/usuarios/[id]` | service rejeita exclusão de MASTER por não-MASTER |
| `POST /api/usuarios/convites` | service rejeita convite MASTER por não-MASTER |

---

## 10. Estrutura de Arquivos (proposta)

```
prisma/
  schema.prisma                                    → ALTERAR (enum Role)
  migrations/<timestamp>_add-role-master/          → CRIAR

src/lib/
  auth.ts                                          → ALTERAR (SessionRole)
  require-admin-session.ts                         → ALTERAR (aceita MASTER)
  require-master-session.ts                        → CRIAR (novo guard)

src/shared/
  utils/require-permission.ts                      → ALTERAR (MASTER bypass)
  constants/role-translations.ts                   → CRIAR

src/modules/usuarios/
  schemas/
    generate-user-invite.schema.ts                 → ALTERAR (adiciona MASTER)
    update-usuario.schema.ts                       → ALTERAR (adiciona MASTER)
  services/
    update-usuario.service.ts                      → ALTERAR (guard MASTER)
    soft-delete-usuario.service.ts                 → ALTERAR (guard MASTER)
    generate-user-invite.service.ts                → ALTERAR (guard MASTER)
  types/
    usuario.type.ts                                → ALTERAR (adiciona MASTER)
    user-invite.type.ts                            → ALTERAR (adiciona MASTER)

src/frontend/features/usuarios/
  components/
    generate-invite-dialog.tsx                     → ALTERAR (role MASTER condicional)
    usuarios-table.tsx                             → ALTERAR (tradução de role, desabilitar ações em MASTER)
    usuario-detail.tsx                             → ALTERAR (tradução de role)
    usuario-form.tsx                               → ALTERAR (tradução de role, adiciona MASTER no select)

src/frontend/
  components/layout/                               → ALTERAR (ocultar link de usuários para STAFF)
  (componente de navegação — identificar arquivo exato antes de implementar)
```

---

## 11. Regras de Validação

- **RV-01** — Schema `generate-user-invite.schema.ts`: `role` aceita `"ADMIN" | "STAFF" | "MASTER"`
- **RV-02** — Schema `update-usuario.schema.ts`: `role` aceita `"ADMIN" | "STAFF" | "MASTER"`
- **RV-03** — Service `update-usuario`: rejeitar se alvo é MASTER e sessão não é MASTER
- **RV-04** — Service `soft-delete-usuario`: rejeitar se alvo é MASTER e sessão não é MASTER
- **RV-05** — Service `generate-user-invite`: rejeitar se role solicitada é MASTER e sessão não é MASTER

---

## 12. Critérios de Aceite

- **CA-01 (RF-02)** — Dado um usuário MASTER autenticado, quando ele acessa `/api/usuarios`, então recebe 200 (guard passa)
- **CA-02 (RF-03)** — Dado um usuário STAFF autenticado, quando ele acessa `/api/usuarios`, então recebe 403
- **CA-04 (RF-04)** — Dado um usuário ADMIN autenticado, quando ele acessa uma rota com `requireMasterSessionForApi()`, então recebe 403
- **CA-05 (RF-05)** — Dado um usuário ADMIN logado, quando ele envia `PATCH /api/usuarios/[id]` para um usuário MASTER, então recebe 403 com código `FORBIDDEN`
- **CA-06 (RF-05)** — Dado um usuário MASTER logado, quando ele envia `PATCH /api/usuarios/[id]` para outro usuário MASTER, então recebe 200
- **CA-07 (RF-06)** — Dado um usuário ADMIN logado, quando ele tenta criar convite com `role: "MASTER"`, então recebe 403
- **CA-08 (RF-06)** — Dado um usuário MASTER logado, quando ele cria convite com `role: "MASTER"`, então recebe 201 com token
- **CA-09 (RF-08)** — Na UI, role é exibida como "Equipe", "Administrador" ou "Master" (nunca o valor enum bruto)
- **CA-10 (RF-09)** — Na UI, opção de role "Master" no dialog de convite só aparece para usuário MASTER logado
- **CA-11 (RF-07)** — Dado um usuário STAFF logado, quando ele navega para `/admin/usuarios`, então é redirecionado para `/`

---

## 13. Riscos e Decisões em Aberto

| ID | Risco / Decisão | Status |
|---|---|---|
| D-01 | `requireAdminSession()` vai aceitar MASTER: decisão tomada — MASTER ≥ ADMIN em hierarquia | Decidido |
| D-02 | `ALTER TYPE ... ADD VALUE` não é transacional no PostgreSQL; migration deve conter apenas essa operação | Decidido |
| D-03 | Componente de navegação onde ocultar link de usuários para STAFF deve ser identificado antes de implementar | Aberto |
| D-04 | Primeiro usuário MASTER: criado via seed com email `master@siao.com.br` e senha `Siao@2026` | Decidido |
| D-05 | ADMIN pode ver na listagem usuários MASTER (read-only) mas não editar/deletar — decisão tomada | Decidido |

---

## 14. Plano de Implementação (ordem)

1. **Banco** — Atualizar `prisma/schema.prisma` (enum Role + MASTER), criar migration, executar `npx prisma generate`
2. **Seed** — Atualizar `prisma/seed.ts` para criar/upsert usuário MASTER com email `master@siao.com.br` e senha `Siao@2026` (hash bcrypt), garantindo que o seed não quebre se o usuário já existir
3. **Auth** — Atualizar `SessionRole` em `auth.ts`
4. **Guards** — Atualizar `require-admin-session.ts` (aceitar MASTER), criar `require-master-session.ts`
5. **Permissões** — Atualizar `hasPermission()` em `require-permission.ts`
6. **Types e Schemas** — Atualizar `usuario.type.ts`, `user-invite.type.ts`, `generate-user-invite.schema.ts`, `update-usuario.schema.ts`
7. **Services** — Atualizar `update-usuario.service.ts`, `soft-delete-usuario.service.ts`, `generate-user-invite.service.ts`
8. **Constantes** — Criar `role-translations.ts`
9. **Frontend** — Atualizar componentes de UI (tradução de role, guard de exibição, opção MASTER condicional no dialog de convite, desabilitar ações em usuários MASTER)
10. **Navegação** — Ocultar link de usuários para STAFF no componente de navegação (identificar arquivo)
11. **Lint + build** — Validar sem erros

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
