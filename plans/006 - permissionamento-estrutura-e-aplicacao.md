# SPEC 006 - Permissionamento: Estrutura Inicial e Aplicacao

## 1. Contexto

O sistema possui usuarios com roles (`ADMIN`, `STAFF`) mas nenhum controle granular de acesso. Com multiplos usuarios no sistema, e necessario definir quais acoes cada usuario pode executar. Esta SPEC cria a infraestrutura de permissoes e a aplica nas features ja existentes (visitantes e culto infantil), garantindo que o controle ocorra tanto na UI (exibicao condicional) quanto na API (bloqueio de acoes nao autorizadas).

**Dependencias:**
- SPEC 004: modelo `User` com role `ADMIN`/`STAFF`, tela de edicao de usuario (secao de permissoes sera preenchida aqui)
- SPEC 005: usuarios criados via convite ja chegam com role definida; permissoes sao atribuidas manualmente pelo admin apos criacao

## 2. Objetivo de Negocio

Garantir que cada usuario acesse somente as funcionalidades para as quais foi autorizado, protegendo dados sensiveis e acoes criticas contra uso indevido, mesmo em caso de falha de UI.

## 3. Escopo

### 3.1 Em escopo

- Modelo de dados `UserPermission` (userId + permission como chave composta)
- Enum de permissoes definido na camada de aplicacao (TypeScript), nao no banco
- Permissoes iniciais cobertas:
  - `VISITANTES_CADASTRAR`
  - `VISITANTES_LISTAR`
  - `VISITANTES_EDITAR`
  - `VISITANTES_EXCLUIR`
  - `VISITANTES_EXPORTAR`
  - `CULTO_INFANTIL_SELECIONAR`
- Role `ADMIN`: bypass completo de todas as verificacoes de permissao
- Tela de edicao de usuario (SPEC 004): secao "Permissoes" com checkboxes por permissao
- Propagacao de permissoes para o frontend via session token (token assinado ja em uso)
- Guard utilitario de permissao para uso nos controllers da API
- Aplicacao dos guards em todos os endpoints existentes de visitantes e no endpoint de culto infantil (quando existir)
- Ocultacao de itens de UI (botoes, menus) baseada nas permissoes da sessao

### 3.2 Fora de escopo

- Permissoes por grupo/equipe (RBAC avancado)
- Auditoria detalhada de quem concedeu permissao e quando
- Interface para gestao de permissoes em lote
- Permissoes de outros modulos ainda nao implementados (ex: financeiro, agenda)
- Heranca de permissoes entre roles

## 4. Requisitos Funcionais

- **RF-01** Todo usuario com role `ADMIN` deve ter acesso irrestrito a todas as funcionalidades, sem necessidade de permissoes explicitamente cadastradas
- **RF-02** Todo usuario com role `STAFF` deve ter acesso apenas as acoes cujas permissoes estejam cadastradas na tabela `UserPermission`
- **RF-03** Na tela de edicao/visualizacao de usuario, deve existir uma secao "Permissoes" com checkboxes para cada permissao disponivel
- **RF-04** As permissoes exibidas devem ser pre-definidas e agrupadas por modulo (ex: "Visitantes", "Culto Infantil")
- **RF-05** O admin deve conseguir salvar/atualizar o conjunto de permissoes de um usuario com um unico botao "Salvar permissoes"
- **RF-06** As permissoes do usuario logado devem ser incluidas no session token no momento do login
- **RF-07** O frontend deve ler as permissoes do session token para exibir/ocultar elementos de UI condicionalmente
- **RF-08** Cada endpoint de API que requer permissao deve validar a permissao a partir da sessao antes de executar
- **RF-09** Tentativa de acao sem permissao na API deve retornar 403 com mensagem clara
- **RF-10** Os endpoints de visitantes devem ter os seguintes guards aplicados:
  - `POST /api/visitantes` → `VISITANTES_CADASTRAR`
  - `GET /api/visitantes` → `VISITANTES_LISTAR`
  - `GET /api/visitantes/[id]` → `VISITANTES_LISTAR`
  - `PATCH /api/visitantes/[id]` → `VISITANTES_EDITAR`
  - `DELETE /api/visitantes/[id]` → `VISITANTES_EXCLUIR`
  - `GET /api/visitantes/export` → `VISITANTES_EXPORTAR`

## 5. Requisitos Nao Funcionais

- **RNF-01** As permissoes no token devem ser um array de strings (`string[]`) incluido no payload existente — sem necessidade de novo mecanismo de sessao
- **RNF-02** A validacao de permissao na API deve ser feita a partir do token (sem query ao banco por request), mantendo performance
- **RNF-03** Se permissoes forem alteradas pelo admin, o usuario afetado precisara fazer novo login para ver as mudancas — comportamento aceitavel e deve ser documentado na UI
- **RNF-04** O enum de permissoes deve ser definido em TypeScript (`as const`) para permitir uso como tipo e como valor, sem criar enum no banco
- **RNF-05** O guard de permissao deve ser uma funcao pura reutilizavel por qualquer controller

## 6. Modelagem de Dados

### Novo model `UserPermission`

```prisma
model UserPermission {
  userId     String
  permission String
  grantedAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, permission])
  @@map("user_permissions")
}
```

### Alteracao no model `User`

```prisma
model User {
  // ... campos existentes ...
  permissions UserPermission[]
}
```

**Decisao tecnica:** `permission` e do tipo `String` (nao enum Prisma) para que novas permissoes possam ser adicionadas sem migration de banco. A validacao dos valores validos ocorre na camada de aplicacao via TypeScript.

**Observacao:** Migration obrigatoria + `npx prisma generate` apos alteracao.

### Alteracao no `SessionPayload` (lib/auth.ts)

```ts
export type SessionPayload = {
  sub: string
  nome: string
  email: string
  role: SessionRole
  permissions: string[]   // <- novo campo
  iat: number
  exp: number
}
```

## 7. Fluxos Funcionais

### 7.1 Login com permissoes

```
Usuario faz login
  -> sign-in.service busca usuario no banco
  -> Carrega permissoes da tabela user_permissions para aquele userId
  -> Se role = ADMIN: permissions = ['*'] (ou array vazio; admin bypassa na logica)
  -> Se role = STAFF: permissions = [...permissoes cadastradas]
  -> Cria session token incluindo permissions[]
  -> Token armazenado em cookie HttpOnly
```

### 7.2 Verificacao na API

```
Request chega em /api/visitantes
  -> Controller extrai token do cookie
  -> Verifica sessao (existente e valida)
  -> Se role = ADMIN: permite acao diretamente
  -> Se role = STAFF: verifica se permissions[] contem a permissao necessaria
  -> Se nao contem: retorna 403
  -> Se contem: executa service normalmente
```

### 7.3 Edicao de permissoes pelo admin

```
Admin acessa /admin/usuarios/[id]/editar
  -> Pagina carrega dados do usuario
  -> Secao "Permissoes" exibe checkboxes por modulo
  -> Checkboxes pre-marcados conforme permissoes atuais do usuario
  -> Admin altera checkboxes e clica "Salvar permissoes"
  -> PATCH /api/usuarios/[id]/permissoes
  -> Service executa upsert/replace atomico das permissoes
  -> UI exibe confirmacao de sucesso
```

### 7.4 Renderizacao condicional na UI

```
Componente da lista de visitantes carrega
  -> Le permissions[] do session token (via hook/context)
  -> Se nao tem VISITANTES_LISTAR: nao exibe listagem (redireciona ou exibe acesso negado)
  -> Botao "Exportar" somente renderiza se tem VISITANTES_EXPORTAR
  -> Botao "Excluir" somente renderiza se tem VISITANTES_EXCLUIR
  -> Etc.
```

## 8. Contratos de Camadas

### Enum de permissoes (application-level)

```ts
// src/shared/constants/permissions.ts
export const Permission = {
  VISITANTES_CADASTRAR:      'VISITANTES_CADASTRAR',
  VISITANTES_LISTAR:         'VISITANTES_LISTAR',
  VISITANTES_EDITAR:         'VISITANTES_EDITAR',
  VISITANTES_EXCLUIR:        'VISITANTES_EXCLUIR',
  VISITANTES_EXPORTAR:       'VISITANTES_EXPORTAR',
  CULTO_INFANTIL_SELECIONAR: 'CULTO_INFANTIL_SELECIONAR',
} as const

export type PermissionKey = typeof Permission[keyof typeof Permission]
```

### Guard utilitario

```ts
// src/shared/utils/require-permission.ts
export function hasPermission(session: SessionPayload, permission: PermissionKey): boolean {
  if (session.role === 'ADMIN') return true
  return session.permissions.includes(permission)
}

// Uso nos controllers:
if (!hasPermission(session, Permission.VISITANTES_LISTAR)) {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Controller `PATCH /api/usuarios/[id]/permissoes`

- Verifica sessao + role ADMIN
- Valida body com `updateUserPermissionsSchema`
- Chama `updateUserPermissionsService(userId, permissions[])`
- Retorna `{ success: true }`

### Services

- `updateUserPermissionsService(userId, permissions[])`: deleta todas as permissoes existentes do usuario e insere as novas (replace atomico via transacao)
- `loadUserPermissionsService(userId)`: busca permissoes do usuario no banco (usado no sign-in)

### Repositories

- `findUserPermissionsByUserIdRepository(userId)`: `prisma.userPermission.findMany({ where: { userId } })`
- `replaceUserPermissionsRepository(userId, permissions[])`: transacao — `deleteMany({ where: { userId } })` + `createMany({ data: [...] })`

## 9. Endpoints

| Metodo | Rota                              | Auth     | Descricao                                      |
|--------|-----------------------------------|----------|------------------------------------------------|
| PATCH  | /api/usuarios/[id]/permissoes     | ADMIN    | Substituir permissoes de um usuario            |
| GET    | /api/usuarios/[id]/permissoes     | ADMIN    | Listar permissoes atuais de um usuario         |

Endpoints existentes modificados (aplicacao de guards):

| Metodo | Rota                          | Permissao requerida (STAFF) |
|--------|-------------------------------|-----------------------------|
| POST   | /api/visitantes               | VISITANTES_CADASTRAR        |
| GET    | /api/visitantes               | VISITANTES_LISTAR           |
| GET    | /api/visitantes/[id]          | VISITANTES_LISTAR           |
| PATCH  | /api/visitantes/[id]          | VISITANTES_EDITAR           |
| DELETE | /api/visitantes/[id]          | VISITANTES_EXCLUIR          |
| GET    | /api/visitantes/export        | VISITANTES_EXPORTAR         |

## 10. Estrutura de Arquivos

```text
src/
  app/
    api/
      usuarios/
        [id]/
          permissoes/
            route.ts                           <- GET, PATCH /api/usuarios/[id]/permissoes

  modules/
    usuarios/
      services/
        update-user-permissions.service.ts
        load-user-permissions.service.ts
      repositories/
        find-user-permissions-by-user-id.repository.ts
        replace-user-permissions.repository.ts
      schemas/
        update-user-permissions.schema.ts
      types/
        user-permission.type.ts

  shared/
    constants/
      permissions.ts                           <- enum Permission + tipo PermissionKey
    utils/
      require-permission.ts                    <- funcao hasPermission

  lib/
    auth.ts                                    <- adicionar permissions[] ao SessionPayload

  frontend/
    features/
      usuarios/
        components/
          user-permissions-form.tsx            <- secao de permissoes na tela de edicao
      shared/
        hooks/
          use-permissions.ts                   <- hook para ler permissoes da sessao
```

## 11. Regras de Validacao

### `updateUserPermissionsSchema`

```ts
z.object({
  permissions: z.array(
    z.enum([
      'VISITANTES_CADASTRAR',
      'VISITANTES_LISTAR',
      'VISITANTES_EDITAR',
      'VISITANTES_EXCLUIR',
      'VISITANTES_EXPORTAR',
      'CULTO_INFANTIL_SELECIONAR',
    ])
  )
})
```

Regras no service:
- Somente permissoes do enum definido sao aceitas (Zod ja garante)
- Array vazio e valido (remove todas as permissoes do usuario)
- Operacao de replace e atomica (transacao Prisma)

## 12. Criterios de Aceite

- **CA-01** (RF-01) Dado um usuario ADMIN logado, quando acessa qualquer rota de visitantes, entao tem acesso pleno independente de ter permissoes cadastradas
- **CA-02** (RF-02) Dado um usuario STAFF sem permissao `VISITANTES_LISTAR`, quando acessa `GET /api/visitantes`, entao recebe resposta 403
- **CA-03** (RF-02) Dado um usuario STAFF com permissao `VISITANTES_LISTAR`, quando acessa `GET /api/visitantes`, entao recebe a listagem normalmente
- **CA-04** (RF-03/RF-04) Dado que o ADMIN edita um usuario, entao a secao "Permissoes" exibe checkboxes agrupados por modulo com os valores atuais pre-marcados
- **CA-05** (RF-05) Dado que o ADMIN altera checkboxes e clica "Salvar permissoes", entao as permissoes sao atualizadas no banco e a UI confirma sucesso
- **CA-06** (RF-06) Dado que um usuario STAFF faz login, entao o session token contem o array `permissions` com as permissoes cadastradas para ele
- **CA-07** (RF-07) Dado que um usuario STAFF sem `VISITANTES_EXPORTAR` esta na listagem de visitantes, entao o botao "Exportar" nao e exibido
- **CA-08** (RF-09) Dado qualquer requisicao a endpoint protegido sem a permissao necessaria, entao o servidor retorna 403 com mensagem de erro clara
- **CA-09** (RF-10) Dado um usuario STAFF com apenas `VISITANTES_LISTAR`, quando tenta `DELETE /api/visitantes/[id]`, entao recebe 403

## 13. Riscos e Decisoes em Aberto

| # | Risco / Decisao                                                                                                | Status       |
|---|----------------------------------------------------------------------------------------------------------------|--------------|
| 1 | Permissoes no token vs. query por request: token escolhido por performance; trade-off e que mudancas so aplicam no proximo login | Decidido |
| 2 | Enum no banco vs. string: string escolhida para evitar migration a cada nova permissao; validacao garantida por Zod e TypeScript | Decidido |
| 3 | Replace atomico de permissoes (delete + insert em transacao) preferido sobre upsert incremental para simplicidade | Decidido |
| 4 | Permissoes do ADMIN: nao sao gravadas no banco (role bypassa tudo); `permissions: []` no token para ADMIN e aceitavel | Decidido |
| 5 | Notificacao ao admin de que permissoes so valem apos re-login do usuario afetado: adicionar texto informativo na UI de edicao | Decidido |
| 6 | Culto infantil: permissao `CULTO_INFANTIL_SELECIONAR` criada mas endpoint ainda nao existe; guard sera aplicado quando endpoint for criado | Decidido |

## 14. Plano de Implementacao

1. Garantir que SPEC 004 foi implementada (User com role ADMIN/STAFF, tela de edicao)
2. Criar `src/shared/constants/permissions.ts` com enum de permissoes
3. Atualizar `prisma/schema.prisma`: adicionar model `UserPermission` e relacao em `User`
4. Criar migration: `npx prisma migrate dev --name add-user-permissions`
5. Executar `npx prisma generate`
6. Atualizar `lib/auth.ts`: adicionar `permissions: string[]` ao `SessionPayload` e `SessionUser`
7. Criar `user-permission.type.ts`
8. Criar `update-user-permissions.schema.ts`
9. Criar repositories: `find-user-permissions-by-user-id`, `replace-user-permissions`
10. Criar services: `update-user-permissions`, `load-user-permissions`
11. Modificar `sign-in-auth.service.ts`: carregar permissoes do banco e incluir no token
12. Criar `src/shared/utils/require-permission.ts` (funcao `hasPermission`)
13. Aplicar guards em todos os endpoints de visitantes existentes
14. Criar endpoint `GET /PATCH /api/usuarios/[id]/permissoes`
15. Criar hook `use-permissions.ts` no frontend
16. Criar componente `user-permissions-form.tsx` e integrar na tela de edicao de usuario
17. Aplicar exibicao condicional de botoes/acoes na UI de visitantes baseada nas permissoes

## 15. Estrategia de Testes

- **Permissoes constants:** nao precisa de teste; e apenas um objeto TypeScript
- **Schema:** teste unitario de `updateUserPermissionsSchema` — permissao invalida rejeitada, array vazio aceito
- **Service update-permissions:** fluxo feliz substitui permissoes corretamente; array vazio remove todas; transacao falha nao deixa estado inconsistente
- **Service load-permissions:** retorna array de strings para usuario com permissoes; array vazio para usuario sem permissoes
- **Guard hasPermission:** ADMIN retorna true para qualquer permissao; STAFF retorna true apenas para permissoes no array; STAFF retorna false para permissao ausente
- **Sign-in service (modificado):** token gerado contem campo `permissions` com dados corretos
- **Endpoints de visitantes (guards):** ADMIN acessa todos; STAFF sem permissao recebe 403; STAFF com permissao correta recebe 200
- **Endpoint permissoes:** ADMIN atualiza com sucesso; nao-ADMIN recebe 403; payload invalido recebe 400
- **UI:** checkboxes renderizam com estado correto (marcados/desmarcados); botao exportar oculto sem permissao; botao excluir oculto sem permissao

---

## Status de Execucao

- Estado: `Backlog`
- Responsavel: `<definir>`
- Ultima atualizacao: `2026-04-14`

### Checklist de Entrega

- [ ] Schema criado/atualizado
- [ ] Repository criado/atualizado
- [ ] Service criado/atualizado
- [ ] Controller/route criado/atualizado
- [ ] UI criada/atualizada
- [ ] Migration criada
- [ ] `npx prisma generate` executado
- [ ] Testes adicionados/atualizados
- [ ] Testes passando
- [ ] Lint sem erro
- [ ] Criterios de aceite validados
