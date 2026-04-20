# SPEC 015 - Perfil do Usuário Logado

## 1. Contexto

Atualmente o menu da navbar do usuário autenticado (área com o nome do usuário) oferece apenas a opção de logout. O usuário não tem forma de visualizar ou editar seus próprios dados (nome, sobrenome, senha) sem intervenção de administrador.

Esta SPEC adiciona a opção "Meu Perfil" ao menu de usuário existente na `AuthenticatedShell` e implementa a página completa de perfil com visualização e edição dos dados pessoais e de senha.

---

## 2. Objetivo de Negocio

Permitir que qualquer usuário autenticado (ADMIN ou STAFF) visualize e atualize seus próprios dados de forma autônoma, incluindo alteração de senha com confirmação da senha atual, reduzindo dependência de administradores para manutenção de dados pessoais.

---

## 3. Escopo

### 3.1 Em escopo

- Opção "Meu Perfil" no menu de usuário da navbar (acima de "Sair")
- Página `/perfil` protegida por sessão (qualquer usuário autenticado)
- Visualização dos dados: nome, sobrenome, email (email somente leitura)
- Edição de nome e sobrenome
- Troca de senha: requer confirmação da senha atual + nova senha + confirmação da nova senha
- Endpoint `GET /api/usuarios/me` para carregar dados do perfil
- Endpoint `PUT /api/usuarios/me` para atualizar nome/sobrenome
- Endpoint `PUT /api/usuarios/me/senha` para alterar senha

### 3.2 Fora de escopo

- Alteração de email
- Alteração de role/permissões pelo próprio usuário
- Upload de foto de perfil
- Exclusão da própria conta
- Administrador editar perfil de outro usuário por esta rota (existe em `/admin/usuarios`)

---

## 4. Requisitos Funcionais

- **RF-01**: O menu de usuário na navbar exibe a opção "Meu Perfil" além de "Sair"
- **RF-02**: Ao clicar em "Meu Perfil", usuário é redirecionado para `/perfil`
- **RF-03**: A página `/perfil` exibe nome, sobrenome e email do usuário logado
- **RF-04**: Email é exibido como campo somente leitura (não editável)
- **RF-05**: Usuário pode editar nome e sobrenome; ao salvar, os dados são atualizados
- **RF-06**: Para trocar senha, usuário deve informar senha atual; sistema valida se corresponde ao hash armazenado
- **RF-07**: Nova senha deve seguir as mesmas regras de criação (mínimo 8 chars, maiúscula, minúscula, número, especial)
- **RF-08**: Confirmação da nova senha deve coincidir com a nova senha informada
- **RF-09**: Se a senha atual informada estiver incorreta, sistema retorna erro claro sem alterar a senha
- **RF-10**: Após atualização bem-sucedida de dados pessoais ou senha, exibe mensagem de sucesso
- **RF-11**: O token de sessão não é renovado automaticamente após a troca de senha — usuário precisa fazer logout e login para sessão refletir dados atualizados (nome)

---

## 5. Requisitos Nao Funcionais

- Rota protegida por `requireAuthSession` — qualquer usuário autenticado
- Sem guard de permissão específica — todo usuário tem acesso ao próprio perfil
- Endpoints acessam apenas os dados do usuário identificado pelo `sub` da sessão — sem possibilidade de acessar dados de outro usuário por parâmetro
- `sobrenomeEncrypted` armazenado criptografado conforme padrão existente

---

## 6. Modelagem de Dados

Nao há mudanças de schema. Os modelos `User` existentes atendem à necessidade.

Verificar na implementação:

- Campo `nome` em `User`
- Campo `sobrenomeEncrypted` em `User` (verificar se há campo descriptografado ou helper)
- Campo `passwordHash` em `User`

---

## 7. Fluxos Funcionais

### Fluxo: Visualizar perfil

```
GET /api/usuarios/me
  → getMyProfileService(userId)
    → findUserByIdRepository(userId)
  ← { id, nome, sobrenome (descriptografado), email, role }
```

### Fluxo: Atualizar dados pessoais

```
PUT /api/usuarios/me { nome, sobrenome }
  → updateMyProfileService(userId, { nome, sobrenome })
    → updateUserProfileRepository(userId, { nome, sobrenomeEncrypted })
  ← { success: true }
```

### Fluxo: Alterar senha

```
PUT /api/usuarios/me/senha { senhaAtual, novaSenha, confirmacaoNovaSenha }
  → updateMyPasswordService(userId, { senhaAtual, novaSenha })
    → findUserByIdRepository(userId)          ← para obter passwordHash atual
    → bcrypt.compare(senhaAtual, passwordHash) ← validar senha atual
    → updateUserPasswordRepository(userId, novoHash) ← atualizar hash
  ← { success: true } ou AppError 400 se senha atual incorreta
```

---

## 8. Contratos de Camadas (Arquitetura)

### Controller: `GET /api/usuarios/me/route.ts`

- Extrai `userId` do `session.sub`
- Chama `getMyProfileService`
- Retorna 200 com dados do perfil

### Controller: `PUT /api/usuarios/me/route.ts`

- Valida body com `updateMyProfileSchema`
- Extrai `userId` do `session.sub`
- Chama `updateMyProfileService`
- Retorna 200 `{ success: true }`

### Controller: `PUT /api/usuarios/me/senha/route.ts`

- Valida body com `updateMyPasswordSchema`
- Extrai `userId` do `session.sub`
- Chama `updateMyPasswordService`
- Retorna 200 em sucesso, 400 se senha atual incorreta

### Service: `get-my-profile.service.ts`

- Busca usuário por id
- Descriptografa sobrenome se necessário
- Retorna DTO de perfil

### Service: `update-my-profile.service.ts`

- Valida existência do usuário
- Atualiza nome e sobrenomeEncrypted

### Service: `update-my-password.service.ts`

- Busca usuário por id
- Compara senha atual com hash (bcrypt.compare)
- Lança `AppError(400, "SENHA_ATUAL_INCORRETA")` se não bater
- Gera novo hash (12 rounds)
- Atualiza passwordHash

---

## 9. Endpoints

| Método | Rota                     | Autenticação | Permissão      | Descrição                |
| ------ | ------------------------ | ------------ | -------------- | ------------------------ |
| `GET`  | `/api/usuarios/me`       | Sessão ativa | Nenhuma (self) | Carregar dados do perfil |
| `PUT`  | `/api/usuarios/me`       | Sessão ativa | Nenhuma (self) | Atualizar nome/sobrenome |
| `PUT`  | `/api/usuarios/me/senha` | Sessão ativa | Nenhuma (self) | Alterar senha            |

---

## 10. Estrutura de Arquivos (proposta)

```
src/modules/usuarios/
  schemas/
    update-my-profile.schema.ts
    update-my-password.schema.ts
  services/
    get-my-profile.service.ts
    update-my-profile.service.ts
    update-my-password.service.ts
  repositories/
    update-user-profile.repository.ts      ← se não existir
    update-user-password.repository.ts     ← pode reutilizar de SPEC 014

src/app/api/usuarios/me/
  route.ts                                  ← GET + PUT
  senha/route.ts                            ← PUT

src/app/(web_pages)/
  perfil/page.tsx

src/frontend/features/
  perfil/
    components/
      perfil-view.tsx                       ← view principal
      perfil-dados-form.tsx                 ← formulário nome/sobrenome
      perfil-senha-form.tsx                 ← formulário de troca de senha

src/frontend/components/layout/
  authenticated-shell.tsx                   ← adicionar "Meu Perfil" no menu
```

---

## 11. Regras de Validacao

### `updateMyProfileSchema`

```ts
z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  sobrenome: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(100),
});
```

### `updateMyPasswordSchema`

```ts
z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual"),
  novaSenha: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  confirmacaoNovaSenha: z.string(),
}).refine((d) => d.novaSenha === d.confirmacaoNovaSenha, {
  message: "As senhas não coincidem",
  path: ["confirmacaoNovaSenha"],
});
```

---

## 12. Criterios de Aceite

- **CA-01** (RF-01, RF-02): Dado usuário autenticado na navbar, quando abrir o menu de usuário, então vê "Meu Perfil" e "Sair". Ao clicar em "Meu Perfil", é redirecionado para `/perfil`.
- **CA-02** (RF-03, RF-04): A página `/perfil` exibe nome, sobrenome e email; o campo email está desabilitado/readonly.
- **CA-03** (RF-05): Dado nome e sobrenome válidos, quando salvar, então dados são atualizados e mensagem de sucesso é exibida.
- **CA-04** (RF-06, RF-09): Dado senha atual incorreta, quando tentar alterar senha, então recebe erro 400 com mensagem "Senha atual incorreta" sem alterar a senha.
- **CA-05** (RF-07, RF-08): Dado nova senha sem critérios mínimos ou confirmação não coincidente, então validação impede o envio com mensagem clara.
- **CA-06** (RF-07): Dado nova senha válida e senha atual correta, quando salvar, então senha é atualizada e mensagem de sucesso é exibida.
- **CA-07**: Rota `/perfil` retorna 401 para usuário não autenticado.
- **CA-08**: Endpoints `/api/usuarios/me` e `/api/usuarios/me/senha` retornam 401 sem sessão.

---

## 13. Riscos e Decisoes em Aberto

| Item                                    | Descrição                                                                   | Decisão                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `sobrenomeEncrypted`                    | Verificar se há helper de criptografia/descriptografia disponível em `lib/` | Reutilizar o padrão já utilizado no módulo de usuários                             |
| Renovação de sessão após edição de nome | Sessão contém `nome` no payload — ao atualizar, sessão fica desatualizada   | RF-11: usuário precisa fazer logout/login para sessão refletir; exibir aviso na UI |
| `update-user-password.repository.ts`    | Pode ser criado na SPEC 014 — reutilizar                                    | Compartilhar repository entre SPEC 014 e 015                                       |
| Layout da página de perfil              | Seção de dados pessoais separada de troca de senha                          | Dois cards/formulários distintos na mesma página                                   |

---

## 14. Plano de Implementacao (ordem)

1. Criar schemas: `update-my-profile.schema.ts`, `update-my-password.schema.ts`
2. Criar repositories: `update-user-profile.repository.ts` (se não existir), `update-user-password.repository.ts` (reutilizar de SPEC 014 se disponível)
3. Criar services: `get-my-profile.service.ts`, `update-my-profile.service.ts`, `update-my-password.service.ts`
4. Criar controllers: `/api/usuarios/me/route.ts` (GET + PUT), `/api/usuarios/me/senha/route.ts` (PUT)
5. Criar componentes: `perfil-dados-form.tsx`, `perfil-senha-form.tsx`, `perfil-view.tsx`
6. Criar page: `/perfil/page.tsx`
7. Atualizar `authenticated-shell.tsx` — adicionar "Meu Perfil" no menu de usuário
8. Rodar testes e lint

---

## 15. Estrategia de Testes

### Schemas

- `update-my-profile.schema.test.ts`: campos válidos, nome muito curto, sobrenome ausente
- `update-my-password.schema.test.ts`: senhas coincidentes, não coincidentes, nova senha sem critérios

### Services

- `get-my-profile.service.test.ts`: retorna DTO correto, usuário não encontrado lança AppError
- `update-my-profile.service.test.ts`: atualiza com dados válidos, chama repository
- `update-my-password.service.test.ts`:
  - Senha atual correta → atualiza hash
  - Senha atual incorreta → lança AppError 400
  - Mock de bcrypt.compare

### Routes

- `me/route.test.ts`:
  - GET 200 com payload esperado
  - GET 401 sem sessão
  - PUT 200 dados atualizados
  - PUT 400 dados inválidos
  - PUT 401 sem sessão
- `me/senha/route.test.ts`:
  - PUT 200 senha alterada
  - PUT 400 senha atual incorreta
  - PUT 400 validação schema
  - PUT 401 sem sessão

### UI

- `perfil-view.test.tsx`: renderiza campos, email desabilitado
- `perfil-dados-form.test.tsx`: submit válido chama API, exibe mensagem de sucesso/erro
- `perfil-senha-form.test.tsx`: validação inline, submit chama API, erro de senha atual

---

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `GitHub Copilot`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [x] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado
- [x] UI criada/atualizada (quando aplicavel)
- [x] Migration criada (quando aplicavel) - Nao se aplica (sem mudanca de schema)
- [x] `npx prisma generate` executado (quando aplicavel) - Nao se aplica (sem mudanca de schema)
- [x] Testes adicionados/atualizados
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados

## Pos-mortem curto

- O reaproveitamento de padroes existentes (requireAuthSessionForApi, toErrorResponse, criptografia de sobrenome e updateUserPasswordRepository) acelerou a entrega sem desalinhar arquitetura.
- A principal friccao ficou nos testes de UI com labels do MUI; a estrategia mais robusta foi usar queries por role/name e getAllByLabelText para evitar ambiguidade de acessibilidade.
- A regra de negocio de sessao nao renovada apos update de nome/senha foi documentada e refletida na UI com aviso explicito para logout/login.
- Entrega fechada sem mudanca de schema Prisma, com 100% da suite de testes passando no estado atual do repositorio.
