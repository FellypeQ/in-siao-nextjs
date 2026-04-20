# Criação de PR

## Instruções

Com base nas alterações realizadas, atualize o conteúdo do arquivo com:

- O nome na branch, podendo ser:
  - feature/...-...
  - hotfix/...-...
  - refactor/...-...
- Titulo do PR
- Descrição do PR

Após isso, crie a branch e os commits necessários.

A sincronização da branch com o remote e a criação do PR serão feitas manualmente

## Textos gerados

<!-- conteúdo deve ser escrito aqui em baixo -->

### Nome da branch

feature/spec-014-password-reset-email-preview

### Título do PR

feat: implementa fluxo de esqueci minha senha com reset via email (SPEC 014)

### Descrição do PR

## Contexto

Implementacao da SPEC 014 para habilitar recuperacao de senha com token por email, incluindo paginas publicas de solicitacao/confirmacao, rotas API, modelagem de token no banco, envio de email via Resend e cobertura de testes.

## O que foi implementado

### Fluxo completo de password reset

- Criadas as paginas publicas:
  - `/(web_pages)/esqueci-minha-senha`
  - `/(web_pages)/redefinir-senha`
- Adicionado link "Esqueci minha senha" na tela de login.
- Implementado redirecionamento de sucesso para `/login?status=password-reset-success` apos reset.

### API e camada de dominio

- Criados endpoints publicos:
  - `POST /api/auth/password-reset/request`
  - `POST /api/auth/password-reset/confirm`
- Criados schemas Zod de request/confirm.
- Criados repositories para token de reset e atualizacao de senha.
- Criados services de solicitacao e confirmacao do reset.
- Implementado rate limit in-memory (5 req / 15 min) no endpoint de request.

### Email e preview

- Criado job `send-password-reset-email.job.ts` com Resend.
- Criado template React Email `password-reset.tsx` com render utilitario.
- Ajustado script de preview para carregar variaveis de ambiente no CLI:
  - `node --env-file=.env ./node_modules/react-email/dist/cli/index.mjs dev --dir ./src/mailer/templates --port 4000`
- Template passou a usar `NEXT_PUBLIC_STORAGE_URL` para assets publicos.

### Banco de dados

- Adicionado model `PasswordResetToken` no Prisma.
- Criada migration `20260420170606_add_password_reset_tokens`.
- Prisma Client atualizado.

### Controle de acesso publico

- Atualizado `src/proxy.ts` para permitir acesso publico as rotas:
  - `/esqueci-minha-senha`
  - `/redefinir-senha`
  - `/api/auth/password-reset/request`
  - `/api/auth/password-reset/confirm`

### Documentacao

- Atualizada a SPEC 014 com status de execucao, complementos (email/testes/preview) e pos-mortem curto.

## Testes

- Novos testes de schema, service, route e UI para o fluxo de password reset.
- Cobertura de cenarios de validacao, expiracao de token, nao vazamento de existencia de email e rate limit.
- Execucoes validadas durante a entrega:
  - `npm run test -- test/frontend/features/auth/components/forgot-password-view.test.tsx`
  - `npm run lint -- src/proxy.ts`
