# SPEC 014 - Esqueci Minha Senha (Password Reset via Email)

## 1. Contexto

Atualmente o sistema não possui mecanismo de recuperação de senha. O único caminho para um usuário obter acesso é via convite de administrador com criação de senha no cadastro. Se o usuário esquecer a senha, depende de intervenção manual de um administrador.

Esta SPEC implementa o fluxo completo de "esqueci minha senha": solicitação via email, envio de link seguro com token de expiração e página pública para definir nova senha.

---

## 2. Objetivo de Negocio

Permitir que usuários recuperem o acesso de forma autônoma sem necessitar de intervenção administrativa, reduzindo fricção operacional e melhorando a experiência de uso do sistema.

---

## 3. Escopo

### 3.1 Em escopo

- Página pública `/esqueci-minha-senha` com campo de email
- API pública `POST /api/auth/password-reset/request` para solicitar reset
- Envio de email com link seguro contendo token único e com expiração de 1 hora
- Modelo `PasswordResetToken` no banco para gerenciar tokens
- API pública `POST /api/auth/password-reset/confirm` para validar token e redefinir senha
- Página pública `/redefinir-senha?token=XXX` para o usuário definir nova senha
- A senha atual **não é invalidada** ao criar o token — somente após uso do link
- Link de "Esqueci minha senha" na tela de login
- Serviço de email via Resend configurável por variável de ambiente (`RESEND_API_KEY`, `FROM_EMAIL`)
- Rate limiting básico (in-memory) no endpoint de solicitação: máx. 5 requisições por IP a cada 15 min
- Preview local do template de email de reset via React Email (`yarn email`)
- Carregamento explícito de `.env` no preview de email para resolver variáveis em runtime (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STORAGE_URL`)

### 3.2 Fora de escopo

- Reset de senha por administrador (painel admin)
- Envio de SMS
- Autenticação de dois fatores
- Expiração da sessão ativa ao redefinir senha
- Envio de múltiplos emails de reset — sobrescrever token anterior
- Auditoria de tokens usados (tokens são deletados após uso, não marcados como usados)

---

## 4. Requisitos Funcionais

- **RF-01**: Usuário acessa `/esqueci-minha-senha`, informa o email e submete o formulário
- **RF-02**: Sistema verifica se o email existe no banco (usuário não deletado); se não existir, retorna resposta genérica de sucesso (segurança — não vazar se email existe)
- **RF-03**: Sistema gera um token único (UUID v4), salva no banco com `expiresAt = now + 1h` e envia email com o link `/redefinir-senha?token=<token>`
- **RF-04**: Se já existe um token ativo para o email, o token anterior é invalidado e um novo é criado (sobrescrita)
- **RF-05**: Usuário acessa o link recebido, informa nova senha e confirma
- **RF-06**: Sistema valida: token existe, não expirou, não foi usado; se inválido retorna erro específico ao usuário
- **RF-07**: Sistema atualiza `passwordHash` do usuário e deleta todos os tokens de reset daquele usuário
- **RF-08**: A senha atual permanece válida até que o usuário conclua o fluxo de reset com sucesso
- **RF-09**: Após redefinição bem-sucedida, usuário é redirecionado para `/login` com mensagem de sucesso
- **RF-10**: Token expirado ou já usado exibe mensagem clara orientando nova solicitação

---

## 5. Requisitos Nao Funcionais

- Token gerado com `crypto.randomUUID()` — sem previsibilidade
- Link de reset usa HTTPS em produção (variável `NEXT_PUBLIC_APP_URL`)
- Email via Resend (`RESEND_API_KEY`, `FROM_EMAIL` já presentes no `.env`)
- `passwordHash` gerado com bcrypt (12 rounds) — mesmo padrão do cadastro
- Rotas de reset são **públicas** — sem guard de sessão
- Tempo de expiração configurável via env (`PASSWORD_RESET_TOKEN_EXPIRY_MINUTES`, default: 60)
- Rate limiting in-memory: máx. 5 requisições por IP a cada 15 min no endpoint de solicitação
- Preview local de email deve carregar `.env` explicitamente no processo CLI (`node --env-file=.env ...`) para evitar `process.env` indefinido fora do runtime Next.js

---

## 6. Modelagem de Dados

### Novo modelo: `PasswordResetToken`

```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}
```

> **Sem campo `usedAt`**: após uso bem-sucedido, todos os tokens do usuário são deletados via `deleteUserPasswordResetTokensRepository`. Token inválido ou expirado retorna mensagem de "link expirado".

### Relação em `User`

```prisma
passwordResetTokens PasswordResetToken[]
```

> **onDelete: Cascade**: se o User for excluído (hard delete futuro), tokens órfãos são removidos automaticamente.

---

## 7. Fluxos Funcionais

### Fluxo de solicitação

```
POST /api/auth/password-reset/request { email }
  → requestPasswordResetService(email)
    → findUserByEmailRepository(email)          ← verifica existência
    → invalidatePreviousResetTokensRepository(userId) ← invalida tokens anteriores
    → createPasswordResetTokenRepository(userId) ← cria token com expiresAt
    → sendPasswordResetEmailJob(email, token)    ← envia email (pode ser síncrono)
  ← 200 { message: "Se o email existir, você receberá um link." }
```

### Fluxo de redefinição

```
POST /api/auth/password-reset/confirm { token, password, confirmPassword }
  → confirmPasswordResetService(token, password)
    → findPasswordResetTokenRepository(token)   ← verifica existência e validade
    → updateUserPasswordRepository(userId, hash) ← atualiza hash
    → markPasswordResetTokenUsedRepository(tokenId) ← marca usedAt
  ← 200 { success: true }
```

---

## 8. Contratos de Camadas (Arquitetura)

### Controller: `POST /api/auth/password-reset/request/route.ts`
- Valida body com Zod (`requestPasswordResetSchema`)
- Chama `requestPasswordResetService`
- **Sempre** retorna 200 com mensagem genérica (RF-02 — não vazar existência de email)

### Controller: `POST /api/auth/password-reset/confirm/route.ts`
- Valida body com Zod (`confirmPasswordResetSchema`)
- Chama `confirmPasswordResetService`
- Retorna 200 em sucesso, 400 em token inválido/expirado/usado

### Service: `request-password-reset.service.ts`
- Verifica usuário por email (sem lançar erro se não existir — retorna silenciosamente)
- Invalida tokens anteriores
- Cria novo token
- Dispara envio de email

### Service: `confirm-password-reset.service.ts`
- Busca token no banco
- Lança `AppError(400, "INVALID_RESET_TOKEN")` com mensagem "Link inválido ou expirado" se: não encontrado ou expirado (`expiresAt < now`)
- Gera novo hash com bcrypt (12 rounds)
- Atualiza senha do usuário
- Deleta todos os tokens de reset do usuário (`deleteUserPasswordResetTokensRepository`)

### Job: `send-password-reset-email.job.ts`
- Recebe email do destinatário e token
- Monta link: `${NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`
- Envia via Resend SDK (`RESEND_API_KEY`, `FROM_EMAIL`)

---

## 9. Endpoints

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/password-reset/request` | Pública | Solicitar link de reset |
| `POST` | `/api/auth/password-reset/confirm` | Pública | Confirmar e redefinir senha |

---

## 10. Estrutura de Arquivos (proposta)

```
prisma/schema.prisma                                             ← adicionar PasswordResetToken
prisma/migrations/<timestamp>_add_password_reset_tokens/
package.json                                                     ← script `email` com `node --env-file=.env` para preview

src/modules/auth/
  schemas/
    request-password-reset.schema.ts
    confirm-password-reset.schema.ts
  services/
    request-password-reset.service.ts
    confirm-password-reset.service.ts
  repositories/
    find-password-reset-token.repository.ts
    create-password-reset-token.repository.ts
    delete-user-password-reset-tokens.repository.ts              ← usado antes de criar novo E após uso
    update-user-password.repository.ts
  jobs/
    send-password-reset-email.job.ts

src/lib/
  rate-limiter.ts                                                ← rate limiting in-memory por IP

src/app/api/auth/password-reset/
  request/route.ts
  confirm/route.ts

src/app/(web_pages)/
  esqueci-minha-senha/page.tsx
  redefinir-senha/page.tsx

src/frontend/features/auth/components/
  forgot-password-view.tsx
  reset-password-view.tsx

src/mailer/templates/
  password-reset.tsx                                             ← template React Email consumindo `NEXT_PUBLIC_APP_URL` e `NEXT_PUBLIC_STORAGE_URL`
```

---

## 11. Regras de Validacao

### `requestPasswordResetSchema`

```ts
z.object({
  email: z.string().email("Email inválido")
})
```

### `confirmPasswordResetSchema`

```ts
z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
})
```

> Reutilizar `PasswordRulesChecklist` existente para exibir critérios em tempo real.

---

## 12. Criterios de Aceite

- **CA-01** (RF-01, RF-02): Dado um email não cadastrado, quando o usuário submeter, então recebe mensagem genérica de sucesso sem indicação de que o email não existe.
- **CA-02** (RF-03): Dado um email cadastrado válido, quando o usuário submeter, então um token é criado no banco com `expiresAt = now + 1h` e um email é enviado com o link correto.
- **CA-03** (RF-04): Dado que já existe token ativo para o email, quando nova solicitação for feita, então o token anterior é invalidado e novo token é gerado.
- **CA-04** (RF-05, RF-07): Dado um token válido e nova senha válida, quando o usuário confirmar, então a senha é atualizada e o token marcado como usado.
- **CA-05** (RF-06): Dado um token expirado ou já usado, quando o usuário tentar confirmar, então recebe erro 400 com mensagem orientando nova solicitação.
- **CA-06** (RF-08): Dado que o token foi criado mas não usado, quando o usuário fizer login com a senha antiga, então o login é bem-sucedido.
- **CA-07** (RF-09): Dado redefinição bem-sucedida, então usuário é redirecionado para `/login` com mensagem de sucesso visível.
- **CA-08** (RF-10): A página `/redefinir-senha` exibe mensagem de erro clara se o token for inválido ao carregar.
- **CA-09**: O link "Esqueci minha senha" está visível na tela de login.

---

## 13. Riscos e Decisoes em Aberto

| Item | Descrição | Decisão |
|---|---|---|
| Configuração de envio de email | Necessidade de provider transacional para envio de reset com boa entregabilidade | **Resend** via SDK oficial (`RESEND_API_KEY`, `FROM_EMAIL`) |
| Envio de email em produção | Garantir URL correta no link de reset e template HTML consistente | Link baseado em `NEXT_PUBLIC_APP_URL` e HTML renderizado por template React Email |
| Rate limiting | Sem rate limit pode ser abusado para spam de emails | Implementado — in-memory, 5 req/15min por IP |
| `APP_URL` | Necessário para montar o link correto no email | `NEXT_PUBLIC_APP_URL` — já presente no `.env` |
| Assets do template de email | Logo do email precisa URL pública estável | `NEXT_PUBLIC_STORAGE_URL` para compor URL do logo no template |
| `invalidate` de tokens | Marcar `usedAt = now` ou deletar registro? | **Deletar**: após uso, todos os tokens do usuário são deletados. Token inválido = "link expirado". |
| Preview local do template | CLI de preview não injeta `.env` automaticamente como o Next.js | Script `email` com `node --env-file=.env` para garantir env no preview |

---

## 14. Plano de Implementacao (ordem)

1. Atualizar `prisma/schema.prisma` — adicionar `PasswordResetToken` e relação em `User`
2. Criar migration: `npx prisma migrate dev --name add-password-reset-tokens`
3. Executar `npx prisma generate`
4. Criar `src/lib/rate-limiter.ts` (in-memory, 5 req/15min por IP)
5. Criar schemas Zod: `request-password-reset.schema.ts`, `confirm-password-reset.schema.ts`
6. Criar repositories: `find-password-reset-token`, `create-password-reset-token`, `delete-user-password-reset-tokens`, `update-user-password`
7. Criar job: `send-password-reset-email.job.ts`
8. Criar services: `request-password-reset.service.ts`, `confirm-password-reset.service.ts`
9. Criar controllers: `/api/auth/password-reset/request/route.ts`, `/api/auth/password-reset/confirm/route.ts`
10. Criar views: `forgot-password-view.tsx`, `reset-password-view.tsx`
11. Criar pages: `/esqueci-minha-senha/page.tsx`, `/redefinir-senha/page.tsx`
12. Adicionar link "Esqueci minha senha" na `login-page-view.tsx`
13. Rodar testes e lint

---

## 15. Estrategia de Testes

### Schema
- `request-password-reset.schema.test.ts`: email válido, email inválido, campo vazio
- `confirm-password-reset.schema.test.ts`: senhas coincidentes, não coincidentes, senha sem critérios

### Services
- `request-password-reset.service.test.ts`:
  - Email não encontrado → retorna sem erro, sem criar token
  - Usuário desativado (`deletedAt` preenchido) → retorna sem envio de email
  - Email encontrado → cria token, dispara job de email
  - Token anterior existente → invalida antes de criar novo
  - Email de entrada em maiúsculas → normaliza para minúsculas antes da busca
- `confirm-password-reset.service.test.ts`:
  - Token válido → atualiza senha, marca token como usado
  - Token não encontrado → lança AppError 400
  - Token expirado → lança AppError 400
  - Token já usado → lança AppError 400

### Routes (controllers)
- `request/route.test.ts`: 200 com mensagem genérica (email existente e inexistente), 400 body inválido
- `confirm/route.test.ts`: 200 em sucesso, 400 token inválido, 400 validação de schema

### UI
- `forgot-password-view.test.tsx`: renderiza campo email, submit chama API, exibe mensagem de sucesso/erro
- `forgot-password-view.test.tsx`: cobre estado de loading, feedback de rate limit (429) e ação de retorno para login
- `reset-password-view.test.tsx`: renderiza campos senha/confirmar, exibe erro de token inválido, submit bem-sucedido redireciona
- `reset-password-view.test.tsx`: cobre ausência de token na URL, validação local de confirmação de senha e checklist de regras

### Email e Preview
- Validação manual do template `password-reset.tsx` via preview local (`yarn email`)
- Verificação de resolução de env no preview com `NEXT_PUBLIC_APP_URL` e `NEXT_PUBLIC_STORAGE_URL`
- Verificação visual do logo e do link de redefinição renderizados no HTML

## 16. Complementos Implementados (Email, Teste e Preview)

- Script de preview de email atualizado para carregar `.env` explicitamente: `node --env-file=.env ./node_modules/react-email/dist/cli/index.mjs dev --dir ./src/mailer/templates --port 4000`
- Template de email de reset consolidado em `src/mailer/templates/password-reset.tsx` com render utilitário (`renderPasswordResetEmail`) usado no job de envio
- Uso de `NEXT_PUBLIC_STORAGE_URL` no template para assets públicos (logo)
- Cobertura de testes ampliada no frontend para cenários de rate limit, loading e estados de token inválido/ausente
- Cobertura de service ampliada para normalização de email e bloqueio de envio para usuário desativado

---

## 17. Pos-mortem Curto (Aprendizados Operacionais)

### 17.1 O que funcionou bem

- Arquitetura em camadas (route -> service -> repository -> job) facilitou evolução incremental sem acoplamento indevido.
- Estratégia de resposta genérica no endpoint de request manteve segurança contra enumeração de email.
- Cobertura de testes em schemas, services, routes e UI reduziu regressões durante ajustes finais.

### 17.2 O que gerou retrabalho

- Preview do React Email rodando fora do runtime Next.js não carregava `.env` automaticamente, causando `process.env` indefinido no template.
- Rotas públicas de recuperação (`/esqueci-minha-senha`, `/redefinir-senha` e endpoints de reset) não estavam explicitamente liberadas no proxy global, gerando redirecionamento indevido para `/login`.
- Parte da documentação ficou temporariamente desalinhada com a implementação real (referências antigas a marcação de token usado e abordagem SMTP/Nodemailer).

### 17.3 Causa raiz

- Suposição implícita de que ferramentas CLI de preview compartilhariam o mesmo carregamento de variáveis do Next.js.
- Falta de checklist explícito de rotas públicas no momento de introdução de novos fluxos anônimos.
- Atualização da SPEC não realizada imediatamente após mudanças técnicas de detalhe.

### 17.4 Ações corretivas aplicadas

- Script de preview ajustado para `node --env-file=.env` garantindo envs no processo do React Email CLI.
- Proxy atualizado com allowlist das rotas e endpoints públicos do fluxo de password reset.
- SPEC 014 atualizada para refletir implementação real de email, preview e cobertura de testes.

### 17.5 Ações preventivas para próximas SPECs

- Incluir no checklist de entrega de features públicas: validar `PUBLIC_PATHS`/middleware/proxy antes de concluir.
- Para qualquer CLI fora do Next.js, validar explicitamente estratégia de carregamento de `.env` no plano de implementação.
- Ao mudar contratos técnicos (email provider, estratégia de invalidação de token, scripts), atualizar a SPEC no mesmo ciclo da alteração.

---

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `Claude Code`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [x] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado
- [x] UI criada/atualizada (quando aplicavel)
- [x] Migration criada (quando aplicavel)
- [x] `npx prisma generate` executado (quando aplicavel)
- [x] Testes adicionados/atualizados
- [x] Testes passando (201/201)
- [x] Lint sem erro
- [x] Criterios de aceite validados
