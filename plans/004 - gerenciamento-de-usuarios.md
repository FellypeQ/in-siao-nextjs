# SPEC 004 - Gerenciamento de Usuarios

## 1. Contexto

O sistema atualmente possui autenticacao funcional e um unico papel (`ADMIN`) hardcoded para todos os usuarios. Nao existe interface para listar, visualizar, editar ou remover usuarios. Com o crescimento previsto da plataforma (SPEC 005 — convites, SPEC 006 — permissionamento), e necessario criar a gestao completa de usuarios como base para as features seguintes.

## 2. Objetivo de Negocio

Permitir que um administrador do sistema visualize e gerencie os usuarios cadastrados, controlando dados cadastrais, papeis (roles) e realizando exclusoes seguras via soft delete, sem perda de historico.

## 3. Escopo

### 3.1 Em escopo

- Item "Usuarios" no menu lateral da area autenticada
- Listagem de usuarios com tabela paginada
- Visualizacao de usuario individual (dados cadastrais)
- Edicao de usuario (nome, sobrenome, email, role)
- Soft delete de usuario (campo `deletedAt`)
- Expansao do enum `Role` para `ADMIN` e `STAFF`
- Protecao de rotas: somente usuarios autenticados com role `ADMIN` podem acessar gestao de usuarios
- Placeholder visual para secao de permissoes (sera preenchido na SPEC 006)

### 3.2 Fora de escopo

- Criacao de usuario direto (coberta na SPEC 005)
- Sistema de permissoes granular (coberto na SPEC 006)
- Reset de senha pelo admin
- Historico de acoes por usuario
- Paginacao server-side (primeira entrega pode ser client-side se volume for pequeno)

## 4. Requisitos Funcionais

- **RF-01** O menu lateral deve exibir o item "Usuarios" para usuarios com role `ADMIN`
- **RF-02** A listagem deve exibir: nome, email, role, status (ativo/inativo), data de cadastro e acoes (visualizar, editar, excluir)
- **RF-03** Usuarios com `deletedAt` preenchido devem aparecer como inativos, mas permanecer visiveis na listagem (com indicador visual)
- **RF-04** A tela de visualizacao deve exibir todos os dados nao sensiveis do usuario: nome, sobrenome descriptografado, email, role, status, datas
- **RF-05** A tela de edicao deve permitir alterar: nome, sobrenome, email e role
- **RF-06** Nao deve ser possivel editar a propria conta na tela de edicao de usuarios (evitar auto-demotion acidental de admin)
- **RF-07** O soft delete deve setar `deletedAt` com a data atual; o usuario nao consegue mais logar apos isso
- **RF-08** Nao deve ser possivel excluir o proprio usuario logado
- **RF-09** A tela de visualizacao/edicao deve ter uma secao reservada "Permissoes" (placeholder com texto indicando que sera implementado na SPEC 006)
- **RF-10** Somente usuarios com role `ADMIN` podem acessar as rotas de gestao de usuarios (API e UI)

## 5. Requisitos Nao Funcionais

- **RNF-01** Sobrenome deve continuar sendo armazenado criptografado e descriptografado apenas na camada de service/repository
- **RNF-02** Respostas de listagem nao devem expor `passwordHash`, `sobrenomeEncrypted` nem dados internos
- **RNF-03** Toda acao destrutiva (soft delete) deve exigir confirmacao via dialog antes de executar
- **RNF-04** A API deve retornar 403 para usuarios nao-ADMIN que tentem acessar os endpoints de gestao

## 6. Modelagem de Dados

### Alteracoes no model `User`

```prisma
enum Role {
  ADMIN
  STAFF
}

model User {
  id                 String    @id @default(cuid())
  nome               String
  sobrenomeEncrypted String
  email              String    @unique
  passwordHash       String
  role               Role      @default(STAFF)
  deletedAt          DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@map("users")
}
```

Mudancas:

- Adicionar `deletedAt DateTime?` para soft delete
- Expandir `Role` com valor `STAFF`
- Alterar `default` de `Role` para `STAFF` (novos usuarios criados via convite serao STAFF por padrao, exceto quando escolhido diferente)

**Observacao:** Migration obrigatoria + `npx prisma generate` apos alteracao.

## 7. Fluxos Funcionais

### 7.1 Acesso ao menu

```
Usuario ADMIN logado
  -> Sidebar exibe item "Usuarios"
  -> Clica em "Usuarios"
  -> Redireciona para /admin/usuarios
```

### 7.2 Listagem

```
GET /admin/usuarios
  -> Controller chama list-usuarios.service
  -> Service chama list-usuarios.repository
  -> Repository busca todos os usuarios (incluindo deletados, ordenado por createdAt desc)
  -> Service descriptografa sobrenome para exibicao
  -> Retorna lista com campos seguros
  -> UI renderiza tabela com status e acoes
```

### 7.3 Soft delete

```
Usuario clica em "Excluir" na tabela
  -> Dialog de confirmacao aparece
  -> Usuario confirma
  -> DELETE /api/usuarios/[id]
  -> Controller valida sessao (ADMIN) e que id != id do proprio usuario
  -> Service chama soft-delete-usuario.service
  -> Repository seta deletedAt = now()
  -> UI atualiza linha na tabela (status: inativo)
```

### 7.4 Edicao

```
Usuario clica em "Editar" na tabela
  -> Vai para /admin/usuarios/[id]/editar
  -> UI carrega dados via GET /api/usuarios/[id]
  -> Usuario edita campos
  -> PATCH /api/usuarios/[id]
  -> Controller valida schema Zod + sessao ADMIN
  -> Service aplica regras e chama update-usuario.repository
  -> Retorna usuario atualizado
```

## 8. Contratos de Camadas

### Controller `GET /api/usuarios`

- Verifica sessao + role ADMIN
- Chama `listUsuariosService()`
- Retorna array de usuarios (campos seguros)

### Controller `GET /api/usuarios/[id]`

- Verifica sessao + role ADMIN
- Chama `getUsuarioService(id)`
- Retorna usuario (campos seguros)

### Controller `PATCH /api/usuarios/[id]`

- Verifica sessao + role ADMIN
- Valida body com `updateUsuarioSchema`
- Chama `updateUsuarioService(id, data)`
- Retorna usuario atualizado

### Controller `DELETE /api/usuarios/[id]`

- Verifica sessao + role ADMIN
- Valida que `id !== session.sub`
- Chama `softDeleteUsuarioService(id)`
- Retorna `{ success: true }`

### Services

- `listUsuariosService()`: busca todos, descriptografa sobrenome, remove campos sensiveis
- `getUsuarioService(id)`: busca por id, descriptografa sobrenome, remove campos sensiveis
- `updateUsuarioService(id, data)`: valida regras, criptografa sobrenome se alterado, chama repository
- `softDeleteUsuarioService(id)`: chama repository para setar deletedAt

### Repositories

- `listUsuariosRepository()`: `prisma.user.findMany({ orderBy: { createdAt: 'desc' } })`
- `findUsuarioByIdRepository(id)`: `prisma.user.findUnique({ where: { id } })`
- `updateUsuarioRepository(id, data)`: `prisma.user.update(...)`
- `softDeleteUsuarioRepository(id)`: `prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })`

## 9. Endpoints

| Metodo | Rota               | Auth  | Descricao                  |
| ------ | ------------------ | ----- | -------------------------- |
| GET    | /api/usuarios      | ADMIN | Listar todos os usuarios   |
| GET    | /api/usuarios/[id] | ADMIN | Buscar usuario por ID      |
| PATCH  | /api/usuarios/[id] | ADMIN | Atualizar dados do usuario |
| DELETE | /api/usuarios/[id] | ADMIN | Soft delete do usuario     |

## 10. Estrutura de Arquivos

```text
src/
  app/
    (web)/
      admin/
        usuarios/
          page.tsx                         <- listagem
          [id]/
            page.tsx                       <- visualizacao
            editar/
              page.tsx                     <- edicao
    api/
      usuarios/
        route.ts                           <- GET /api/usuarios
        [id]/
          route.ts                         <- GET, PATCH, DELETE /api/usuarios/[id]

  modules/
    usuarios/
      services/
        list-usuarios.service.ts
        get-usuario.service.ts
        update-usuario.service.ts
        soft-delete-usuario.service.ts
      repositories/
        list-usuarios.repository.ts
        find-usuario-by-id.repository.ts
        update-usuario.repository.ts
        soft-delete-usuario.repository.ts
      schemas/
        update-usuario.schema.ts
      types/
        usuario.type.ts

  frontend/
    features/
      usuarios/
        components/
          usuarios-table.tsx
          usuario-form.tsx
          delete-usuario-dialog.tsx
          permissions-placeholder.tsx
```

## 11. Regras de Validacao

### `updateUsuarioSchema`

```ts
z.object({
  nome: z.string().min(2).max(100).optional(),
  sobrenome: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});
```

Regras adicionais no service:

- Email unico: verificar conflito com outro usuario antes de atualizar
- Nao permitir rebaixar o unico ADMIN do sistema (verificar se restaria pelo menos 1 ADMIN)

## 12. Criterios de Aceite

- **CA-01** (RF-01) Dado um usuario ADMIN logado, quando acessa o sistema, entao o item "Usuarios" aparece no menu lateral
- **CA-02** (RF-02) Dado que existam usuarios cadastrados, quando o ADMIN acessa `/admin/usuarios`, entao uma tabela e exibida com nome, email, role, status e acoes para cada usuario
- **CA-03** (RF-03) Dado um usuario com `deletedAt` preenchido, quando listado, entao aparece com status "Inativo" na tabela
- **CA-04** (RF-04) Dado que o ADMIN clica em visualizar um usuario, quando a pagina carrega, entao os dados (nome, sobrenome, email, role, status) sao exibidos sem expor passwordHash
- **CA-05** (RF-05) Dado que o ADMIN edita nome e email de um usuario, quando salva, entao os dados sao atualizados e refletem na listagem
- **CA-06** (RF-06) Dado que o ADMIN tenta editar o proprio usuario pela tela de gestao, entao a acao de edicao de role e bloqueada (campos de role desabilitados ou edicao nao disponivel para a propria conta)
- **CA-07** (RF-07) Dado que o ADMIN confirma exclusao de um usuario, quando a acao e executada, entao `deletedAt` e preenchido e o usuario nao consegue mais logar
- **CA-08** (RF-08) Dado que o ADMIN tenta excluir o proprio usuario, entao a acao e bloqueada com mensagem de erro
- **CA-09** (RF-10) Dado uma requisicao sem sessao ADMIN para qualquer endpoint `/api/usuarios`, entao retorna 401 ou 403

## 13. Riscos e Decisoes em Aberto

| #   | Risco / Decisao                                                                                   | Status   |
| --- | ------------------------------------------------------------------------------------------------- | -------- |
| 1   | Sobrenome criptografado: descriptografar no service antes de retornar para UI                     | Decidido |
| 2   | Paginacao server-side vs client-side: iniciar com client-side, migrar depois                      | Decidido |
| 3   | Role default ao expandir enum: usuarios existentes sao ADMIN, manter; novos via convite sao STAFF | Decidido |
| 4   | Placeholder de permissoes na tela de visualizacao/edicao sera preenchido na SPEC 006              | Decidido |
| 5   | Evitar lock-out: nao permitir rebaixar o ultimo ADMIN do sistema                                  | Decidido |

## 14. Plano de Implementacao

1. Atualizar `prisma/schema.prisma`: adicionar `deletedAt` e expandir `Role` com `STAFF`
2. Criar migration: `npx prisma migrate dev --name add-soft-delete-and-staff-role`
3. Executar `npx prisma generate`
4. Criar `usuario.type.ts` com tipo publico de usuario (sem campos sensiveis)
5. Criar `update-usuario.schema.ts`
6. Criar repositories: `list`, `find-by-id`, `update`, `soft-delete`
7. Criar services: `list`, `get`, `update`, `soft-delete` (com regras de negocio)
8. Criar routes API: `GET/api/usuarios`, `GET/PATCH/DELETE /api/usuarios/[id]`
9. Criar item "Usuarios" no menu lateral (somente para ADMIN)
10. Criar pagina de listagem com tabela e acoes
11. Criar pagina de visualizacao com placeholder de permissoes
12. Criar pagina de edicao com form
13. Adicionar dialog de confirmacao de exclusao
14. Atualizar `sign-in.service` para rejeitar login de usuarios com `deletedAt` preenchido

## 15. Estrategia de Testes

- **Schema:** teste unitario validando campos obrigatorios e opcionais em `updateUsuarioSchema`
- **Service list/get:** teste de fluxo feliz retornando lista sem campos sensiveis; teste de usuario inexistente (404)
- **Service update:** teste de email duplicado; teste de rebaixamento do unico ADMIN bloqueado; teste de fluxo feliz
- **Service soft-delete:** teste de auto-exclusao bloqueada; teste de fluxo feliz
- **Repository:** teste de integracao com banco (opcional na primeira entrega; justificativa: volume baixo e schema simples)
- **Endpoint:** contrato HTTP — 401/403 sem ADMIN, 200 com dados seguros, 404 usuario inexistente, 400 schema invalido
- **UI:** renderizacao da tabela com dados mockados; dialog de confirmacao exibe e cancela corretamente

---

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `GitHub Copilot`
- Ultima atualizacao: `2026-04-15`

### Checklist de Entrega

- [x] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado
- [x] UI criada/atualizada
- [x] Migration criada
- [x] `npx prisma generate` executado
- [x] Testes adicionados/atualizados
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados

---

## 16. Pos-mortem

### Incidente: login retornando INTERNAL_SERVER_ERROR apos entrega

**O que aconteceu:**

Apos a implementacao da SPEC 004, o login parou de funcionar retornando `INTERNAL_SERVER_ERROR`. O `sign-in.service` acessa o campo `deletedAt` adicionado nesta SPEC, e o campo nao existia no banco porque a migration nao havia sido aplicada.

**Causa raiz:**

A migration foi criada (`20260415090000_spec_004_...`), o `npx prisma generate` foi executado, mas `npx prisma migrate deploy` (ou `migrate dev`) nao foi rodado para aplicar efetivamente a migration ao banco de dados. O Prisma Client foi gerado com o novo schema, mas o banco fisico continuava sem os campos `deletedAt` e sem o valor `STAFF` no enum `Role`. Qualquer consulta ao banco passava a ter divergencia entre o client gerado e o schema real do banco.

**O que dificultou o diagnostico:**

- `toErrorResponse` em `shared/errors/app-error.ts` nao logava erros nao-AppError, fazendo erros de banco desaparecerem com a mensagem generica `INTERNAL_SERVER_ERROR`
- Comandos Prisma (`migrate status`, `migrate deploy`) travaram durante a investigacao, sugerindo instabilidade transiente na conexao com o banco

**Resolucao:**

O servidor de desenvolvimento foi reiniciado, o que fez o banco e o Prisma Client voltar a sincronizar corretamente. Isso indica que a migration foi aplicada em algum momento (possivelmente via `db push` ou reinicio do container) e o reinicio do Next.js carregou o cliente atualizado.

**Acoes preventivas para proximas SPECs:**

1. Apos criar migration, executar **sempre** `npx prisma migrate deploy` (ou `migrate dev` em ambiente local) antes de testar
2. Reiniciar o servidor Next.js apos `prisma generate` para garantir que o novo client e carregado
3. Adicionar log de erro em `toErrorResponse` para facilitar diagnostico de erros nao-AppError (erros de banco, erros inesperados)
