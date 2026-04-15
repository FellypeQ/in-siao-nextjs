# SPEC 005 - Criacao de Usuario por Convite

## 1. Contexto

Atualmente o sistema permite cadastro publico de usuarios via tela de login. Isso e inadequado para uma plataforma de gestao de igreja, onde apenas pessoas autorizadas devem ter acesso. Esta SPEC remove o cadastro publico e substitui por um fluxo controlado: somente um usuario ADMIN pode gerar um link de convite com token de uso unico, definindo o nivel de acesso do novo usuario antes de compartilhar o link.

**Dependencia:** SPEC 004 deve ser implementada antes desta SPEC (expansao de `Role` com `STAFF`, campo `deletedAt` no User).

## 2. Objetivo de Negocio

Garantir que apenas pessoas autorizadas por um administrador possam criar conta no sistema, eliminando o risco de acesso nao autorizado via cadastro publico, e controlando o nivel de acesso de cada novo usuario desde o momento de sua criacao.

## 3. Escopo

### 3.1 Em escopo

- Remocao da opcao de cadastro publico na tela de login
- Botao "Gerar convite" na pagina de listagem de usuarios (`/admin/usuarios`)
- Modal/dialog de geracao de convite: admin escolhe role e gera o link
- Exibicao do link gerado com botao de copia (icone clipboard)
- Mensagem explicativa sobre o funcionamento do link apos geracao
- Modelo `UserInvite` no banco: token UUID unico, role, createdBy, usedAt, usedById
- Token de uso unico: invalidado apos utilizacao
- Pagina publica de registro via convite: `/cadastro?token=xxx`
- Validacao do token no carregamento da pagina (token inexistente ou ja usado redireciona com mensagem de erro)
- Formulario de registro identico ao atual (nome, sobrenome, email, senha)
- Endpoint de sign-up modificado para exigir token valido
- Associacao do token ao usuario criado (`usedById`, `usedAt`) apos cadastro bem-sucedido

### 3.2 Fora de escopo

- Tokens com expiracao por tempo (primeira entrega: sem `expiresAt`)
- Listagem/revogacao de convites pendentes pelo admin
- Reenvio de convite
- Convite por email automatico
- "Codigo master" alternativo (mencionado no titulo, adiado para versao futura)

## 4. Requisitos Funcionais

- **RF-01** A tela de login deve exibir apenas o formulario de login (sem aba/botao de cadastro)
- **RF-02** Na listagem de usuarios, deve existir um botao "Gerar convite"
- **RF-03** Ao clicar em "Gerar convite", um dialog/modal deve se abrir com um select de role (`ADMIN` ou `STAFF`) e um botao "Gerar link"
- **RF-04** Ao clicar em "Gerar link", o sistema deve criar um `UserInvite` no banco com token UUID unico e retornar o link completo
- **RF-05** O link gerado deve ser exibido no proprio dialog, com um botao icone de copia (clipboard) ao lado
- **RF-06** Abaixo do link, deve aparecer mensagem explicativa: "Este link e de uso unico. Compartilhe com a pessoa que devera criar a conta. Apos o cadastro ser realizado, o link sera invalidado automaticamente."
- **RF-07** A rota `/cadastro?token=xxx` deve ser publica e acessivel sem autenticacao
- **RF-08** Ao carregar `/cadastro?token=xxx`, o frontend deve validar o token via API antes de exibir o formulario
- **RF-09** Se o token for invalido ou ja utilizado, exibir mensagem de erro e nao exibir formulario
- **RF-10** O formulario de registro deve conter: nome, sobrenome, email, senha (identico ao cadastro atual)
- **RF-11** Ao submeter o formulario com token valido, o sistema deve: criar o usuario com a role do convite, marcar o token como usado (`usedAt`, `usedById`) e redirecionar para login
- **RF-12** Tokens ja utilizados devem retornar erro se tentarem ser reutilizados

## 5. Requisitos Nao Funcionais

- **RNF-01** O token deve ser gerado com `crypto.randomUUID()` (UUID v4), garantindo unicidade sem necessidade de algoritmo adicional
- **RNF-02** A validacao do token na API deve ser atomica: verificar + marcar como usado em uma unica transacao para evitar race conditions
- **RNF-03** O link completo deve usar a URL base do ambiente (`NEXT_PUBLIC_APP_URL` ou `origin` do request)
- **RNF-04** A rota de sign-up deve continuar rejeitando cadastros sem token valido (sem remover a rota, apenas adicionar validacao obrigatoria de token)
- **RNF-05** O endpoint de geracao de convite deve exigir sessao autenticada com role ADMIN

## 6. Modelagem de Dados

### Novo model `UserInvite`

```prisma
model UserInvite {
  id          String    @id @default(cuid())
  token       String    @unique
  role        Role
  createdById String
  usedAt      DateTime?
  usedById    String?
  createdAt   DateTime  @default(now())

  createdBy   User      @relation("InviteCreatedBy", fields: [createdById], references: [id])
  usedBy      User?     @relation("InviteUsedBy", fields: [usedById], references: [id])

  @@map("user_invites")
}
```

### Alteracoes no model `User`

```prisma
model User {
  // ... campos existentes ...
  invitesCreated UserInvite[] @relation("InviteCreatedBy")
  inviteUsed     UserInvite?  @relation("InviteUsedBy")
}
```

**Observacao:** Migration obrigatoria + `npx prisma generate` apos alteracao.

## 7. Fluxos Funcionais

### 7.1 Geracao de convite (admin)

```
Admin acessa /admin/usuarios
  -> Clica em "Gerar convite"
  -> Dialog abre com select de role
  -> Seleciona role (ex: STAFF)
  -> Clica "Gerar link"
  -> POST /api/usuarios/convites
  -> Service gera UUID, cria UserInvite no banco
  -> Retorna link: https://app.insiao.com/cadastro?token=<uuid>
  -> Dialog exibe link + botao copiar + mensagem explicativa
```

### 7.2 Registro via convite (novo usuario)

```
Novo usuario recebe link e acessa /cadastro?token=<uuid>
  -> Frontend le token dos query params
  -> GET /api/auth/convite/validate?token=<uuid>
  -> Se invalido: exibe erro "Link invalido ou ja utilizado"
  -> Se valido: exibe formulario de registro
  -> Usuario preenche nome, sobrenome, email, senha
  -> POST /api/auth/sign-up com { ...dados, token }
  -> Service valida token (dentro de transacao):
      -> Busca UserInvite onde token = token AND usedAt IS NULL
      -> Se nao encontrar: erro "Token invalido"
      -> Cria usuario com role do convite
      -> Atualiza UserInvite: usedAt = now(), usedById = novoUsuario.id
  -> Retorna sucesso
  -> Frontend redireciona para /login com mensagem "Conta criada com sucesso"
```

## 8. Contratos de Camadas

### Controller `POST /api/usuarios/convites`

- Verifica sessao + role ADMIN
- Chama `generateUserInviteService({ role, createdById: session.sub })`
- Retorna `{ token, link }`

### Controller `GET /api/auth/convite/validate`

- Publico (sem autenticacao)
- Le `token` do query param
- Chama `validateUserInviteService(token)`
- Retorna `{ valid: true, role }` ou `{ valid: false }`

### Controller `POST /api/auth/sign-up` (modificado)

- Publico
- Valida body com `signUpWithInviteSchema` (adiciona campo `token`)
- Chama `signUpWithInviteService(data)`
- Retorna `{ success: true }` ou erro

### Services

- `generateUserInviteService({ role, createdById })`: gera UUID, cria registro no banco, monta link com base URL
- `validateUserInviteService(token)`: busca convite valido (usedAt IS NULL), retorna status e role
- `signUpWithInviteService(data)`: dentro de transacao Prisma: valida token, cria usuario, invalida token

### Repositories

- `createUserInviteRepository(data)`: `prisma.userInvite.create(...)`
- `findUserInviteByTokenRepository(token)`: `prisma.userInvite.findUnique({ where: { token } })`
- `useUserInviteRepository(token, userId)`: `prisma.userInvite.update({ where: { token }, data: { usedAt: new Date(), usedById: userId } })`

## 9. Endpoints

| Metodo | Rota                              | Auth     | Descricao                            |
|--------|-----------------------------------|----------|--------------------------------------|
| POST   | /api/usuarios/convites            | ADMIN    | Gerar novo convite com role          |
| GET    | /api/auth/convite/validate        | Publico  | Validar token de convite             |
| POST   | /api/auth/sign-up                 | Publico  | Criar usuario com token de convite   |

## 10. Estrutura de Arquivos

```text
src/
  app/
    (web)/
      cadastro/
        page.tsx                          <- pagina publica de registro via convite
    api/
      usuarios/
        convites/
          route.ts                        <- POST /api/usuarios/convites
      auth/
        convite/
          validate/
            route.ts                      <- GET /api/auth/convite/validate
        sign-up/
          route.ts                        <- modificado para exigir token

  modules/
    usuarios/
      services/
        generate-user-invite.service.ts
        validate-user-invite.service.ts
      repositories/
        create-user-invite.repository.ts
        find-user-invite-by-token.repository.ts
        use-user-invite.repository.ts
      schemas/
        generate-user-invite.schema.ts
      types/
        user-invite.type.ts

    auth/
      schemas/
        sign-up.schema.ts                 <- adicionar campo token obrigatorio
      services/
        sign-up-with-invite-auth.service.ts  <- substitui sign-up-auth.service.ts

  frontend/
    features/
      usuarios/
        components/
          generate-invite-dialog.tsx
      auth/
        components/
          register-via-invite-page-view.tsx
```

## 11. Regras de Validacao

### `generateUserInviteSchema`

```ts
z.object({
  role: z.enum(['ADMIN', 'STAFF'])
})
```

### `signUpWithInviteSchema` (extensao do schema existente)

```ts
z.object({
  nome: z.string().min(2).max(100),
  sobrenome: z.string().min(2).max(100),
  email: z.string().email(),
  senha: z.string().min(8),
  token: z.string().uuid()
})
```

Regras no service:
- Token deve existir e `usedAt` deve ser NULL
- Email nao pode estar em uso por outro usuario ativo
- Toda a operacao de criar usuario + invalidar token deve ser atomica (transacao Prisma)

## 12. Criterios de Aceite

- **CA-01** (RF-01) Dado que um usuario nao autenticado acessa `/login`, entao apenas o formulario de login e exibido (sem opcao de cadastro)
- **CA-02** (RF-02/RF-03) Dado que o ADMIN acessa `/admin/usuarios`, entao o botao "Gerar convite" e visivel e abre um dialog com select de role
- **CA-03** (RF-04/RF-05) Dado que o ADMIN seleciona a role STAFF e clica "Gerar link", entao um link com token UUID e exibido no dialog com botao de copia
- **CA-04** (RF-06) Dado que o link e exibido, entao uma mensagem explicativa sobre uso unico esta presente abaixo do link
- **CA-05** (RF-08/RF-09) Dado que um usuario acessa `/cadastro?token=token-invalido`, entao uma mensagem de erro e exibida e o formulario nao aparece
- **CA-06** (RF-10/RF-11) Dado que um usuario acessa `/cadastro?token=token-valido` e preenche todos os campos corretamente, quando submete, entao a conta e criada, o token e invalidado e o usuario e redirecionado para login
- **CA-07** (RF-12) Dado que um token ja utilizado e enviado novamente no sign-up, entao o servidor retorna erro indicando token invalido
- **CA-08** (RNF-02) Dado que dois cadastros simultaneos tentam usar o mesmo token, entao somente o primeiro e bem-sucedido (atomicidade da transacao)

## 13. Riscos e Decisoes em Aberto

| # | Risco / Decisao                                                                                       | Status       |
|---|-------------------------------------------------------------------------------------------------------|--------------|
| 1 | Tokens sem expiracao por tempo: links gerados permanecem validos ate uso; risco baixo para contexto da igreja | Decidido (sem expiracao na v1) |
| 2 | Race condition no uso do token: resolvido com transacao atomica no service                            | Decidido      |
| 3 | URL base do link: usar `NEXT_PUBLIC_APP_URL` com fallback para `origin` do request                   | Decidido      |
| 4 | Codigo master alternativo: adiado para versao futura, sem impacto nesta SPEC                          | Adiado        |
| 5 | Listagem de convites pendentes: fora do escopo desta entrega                                          | Adiado        |

## 14. Plano de Implementacao

1. Garantir que SPEC 004 foi implementada (Role STAFF disponivel)
2. Atualizar `prisma/schema.prisma`: adicionar model `UserInvite` e relacoes no `User`
3. Criar migration: `npx prisma migrate dev --name add-user-invite`
4. Executar `npx prisma generate`
5. Criar `user-invite.type.ts`
6. Criar schemas: `generate-user-invite.schema.ts`, atualizar `sign-up.schema.ts`
7. Criar repositories: `create-user-invite`, `find-user-invite-by-token`, `use-user-invite`
8. Criar services: `generate-user-invite`, `validate-user-invite`, `sign-up-with-invite-auth`
9. Criar endpoint `POST /api/usuarios/convites`
10. Criar endpoint `GET /api/auth/convite/validate`
11. Modificar `POST /api/auth/sign-up` para exigir token
12. Remover UI de cadastro da tela de login
13. Criar pagina publica `/cadastro` com validacao de token e formulario
14. Criar `generate-invite-dialog.tsx` na pagina de usuarios
15. Adicionar botao "Gerar convite" na listagem de usuarios

## 15. Estrategia de Testes

- **Schema:** teste unitario de `signUpWithInviteSchema` — token ausente, token com formato invalido, campos obrigatorios
- **Service generate:** fluxo feliz gerando UUID e persistindo no banco; verificacao que link contem token
- **Service validate:** token valido retorna `{ valid: true }`; token ja usado retorna `{ valid: false }`; token inexistente retorna `{ valid: false }`
- **Service sign-up:** fluxo feliz cria usuario e invalida token; token invalido retorna erro; email duplicado retorna erro; atomicidade testada com mock de falha na criacao do usuario (token nao deve ser invalidado)
- **Endpoint convites:** 401/403 sem ADMIN, 201 com link gerado
- **Endpoint validate:** 200 com `valid: true` para token valido, `valid: false` para invalido
- **Endpoint sign-up:** 201 com token valido, 400 com token invalido, 409 com email duplicado
- **UI:** dialog renderiza e exibe link apos geracao; botao de copia funciona; pagina `/cadastro` exibe erro para token invalido; formulario submete e redireciona

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

### Incidentes observados apos entrega

**1) Login com `Credenciais invalidas` apos reset/migrations**

- **Sintoma:** usuarios antigos nao conseguiam autenticar.
- **Causa raiz:** banco de desenvolvimento foi resetado para resolver drift de migration e a tabela de usuarios ficou vazia.
- **Resolucao:** criacao de usuario ADMIN de recuperacao para restabelecer acesso.
- **Aprendizado:** quando houver reset de banco em dev, executar bootstrap/seed de usuario administrativo imediatamente.

**2) Erro ao gerar convite apos seed**

- **Sintoma:** endpoint de convite retornava erro interno em contas com sessao antiga.
- **Causa raiz:** cookie de sessao ainda era criptograficamente valido, mas referenciava `session.sub` inexistente apos reset; ao criar `UserInvite`, a FK `createdById` falhava.
- **Resolucao:** validacao de sessao reforcada para consultar o usuario atual no banco (existencia, `deletedAt` e role vigente) em `require-auth-session` e `require-admin-session`.
- **Aprendizado:** sessao nao deve confiar apenas no token assinado; e necessario validar usuario ativo no banco para evitar sessoes orfas.

**3) Diagnostico lento em erros 500**

- **Sintoma:** respostas genericas de erro dificultavam identificar causa real.
- **Causa raiz:** `toErrorResponse` nao registrava detalhes de excecoes nao mapeadas em ambiente local.
- **Resolucao:** adicao de `console.error` detalhado para erros internos quando `NODE_ENV=development`.
- **Aprendizado:** manter observabilidade minima no handler global de erros acelera muito o debug de regressao.

### Acoes preventivas adotadas

1. Sempre executar migration + `prisma generate` + validacao de login/admin apos mudancas de banco.
2. Incluir passo de bootstrap de admin no fluxo de desenvolvimento apos reset do banco.
3. Manter verificacao de usuario ativo nas camadas de sessao (`require-auth-session` e `require-admin-session`).
4. Preservar logs detalhados de erro interno apenas em desenvolvimento.
