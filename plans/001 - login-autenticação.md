# SPEC 001 - Login, Autenticacao e Cadastro

## 1. Contexto

Projeto: in-siao (Igreja Batista Siao)

Objetivo desta SPEC: definir o primeiro fluxo de autenticacao da plataforma, incluindo:

- tela de login
- tela de cadastro
- sessao autenticada com expiracao
- layout base da area logada (sidebar + navbar + home)

## 2. Objetivo de Negocio

Permitir que usuarios autorizados acessem o sistema de forma segura para iniciar o uso administrativo da plataforma, criando a base de autenticacao para todos os modulos futuros.

## 3. Escopo

### 3.1 Em escopo

- Tela de autenticacao com dois modos:
	- Login
	- Cadastro
- Estrutura visual em 3 quadrantes:
	- Esquerda e centro: area unica de banner/informacao (placeholder por enquanto)
	- Direita: formulario (login/cadastro)
- Criacao de usuario com campos obrigatorios:
	- nome
	- sobrenome (armazenado criptografado)
	- email
	- senha forte (hash obrigatorio)
	- role (inicialmente ADMIN)
- Autenticacao por sessao com duracao maxima de 6 horas
- Protecao de rotas autenticadas
- Logout automatico + redirecionamento para login em caso de sessao invalida/expirada
- Layout da area autenticada com:
	- Sidebar a esquerda (somente menu Home por enquanto)
	- Navbar superior:
		- esquerda: texto Siao (clicavel para Home)
		- direita: nome do usuario; ao clicar, mostrar email + acao de logout
- Conteudo da Home com:
	- texto breve sobre o sistema
	- botao Cadastrar visitante (sem acao por enquanto)
	- botao Vincular numero a crianca para salinha (sem acao por enquanto)

### 3.2 Fora de escopo

- Esqueci minha senha
- Recuperacao de conta
- Gestao de perfis e permissoes avancadas
- Multi-role dinamico
- Integracao com provedores externos de auth (Google, Microsoft, etc.)

## 4. Requisitos Funcionais

### RF-01 Login

O usuario deve conseguir autenticar com email + senha validos.

### RF-02 Cadastro

O usuario deve conseguir criar conta informando nome, sobrenome, email e senha.

### RF-03 Role padrao

Todo novo cadastro deve ser criado com role ADMIN nesta primeira versao.

### RF-04 Hash de senha

Senha nunca pode ser salva em texto puro.

### RF-05 Sobrenome protegido

Sobrenome deve ser persistido em formato criptografado no banco.

### RF-06 Sessao expira em 6h

A sessao autenticada deve expirar em no maximo 6 horas.

### RF-07 Protecao global de rotas privadas

Rotas da area autenticada devem validar sessao em toda requisicao.

### RF-08 Logout automatico

Caso sessao esteja ausente, invalida ou expirada, usuario deve ser deslogado e redirecionado para login.

### RF-09 Navegacao basica da area logada

Deve existir Home no menu lateral e navegacao por clique no texto Siao na navbar.

## 5. Requisitos Nao Funcionais

### RNF-01 Arquitetura obrigatoria

Seguir padrao do projeto:

Request -> Controller -> Service -> Repository -> Database

Controllers sem regra de negocio e sem acesso direto ao Prisma.

### RNF-02 Validacao

Todas as entradas devem ser validadas com Zod antes da execucao do service.

### RNF-03 Seguranca

- Hash de senha com algoritmo forte (ex: Argon2 ou bcrypt com custo adequado)
- Nunca retornar senha/hash em resposta
- Mensagens de erro de login sem vazar se o email existe

### RNF-04 Tipagem

Implementacao 100% em TypeScript, sem uso de any.

### RNF-05 UI

Componentes visuais com MUI, mantendo responsividade desktop e mobile.

## 6. Modelagem de Dados (Usuario)

Entidade principal: User

Campos minimos:

- id
- nome
- sobrenomeEncrypted
- email (unico)
- passwordHash
- role (enum: ADMIN)
- createdAt
- updatedAt

### Regras de dados

- email unico e normalizado (lowercase + trim)
- senha validada como forte antes de hash
- sobrenome criptografado antes de persistir

## 7. Regras de Senha Forte

Senha deve atender no minimo:

- 8 caracteres
- 1 letra maiuscula
- 1 letra minuscula
- 1 numero
- 1 caractere especial

Observacao: o limite minimo pode ser elevado em versoes futuras.

## 8. Fluxos Funcionais

### 8.1 Fluxo de cadastro

1. Usuario abre modo Cadastro
2. Preenche nome, sobrenome, email e senha
3. Controller valida schema
4. Service valida regra de negocio e unicidade de email
5. Service criptografa sobrenome e aplica hash na senha
6. Repository cria registro no banco
7. Sistema retorna sucesso e direciona para login (ou login automatico, conforme decisao tecnica da implementacao)

### 8.2 Fluxo de login

1. Usuario informa email e senha
2. Controller valida schema
3. Service busca usuario por email
4. Service compara senha informada com hash salvo
5. Se valido, cria sessao com expiracao de 6h
6. Redireciona para Home autenticada

### 8.3 Fluxo de autorizacao de rota privada

1. Requisicao chega em rota protegida
2. Camada de auth valida sessao
3. Se valido, segue fluxo normal
4. Se invalido/expirado, executa logout e redireciona para login

### 8.4 Fluxo de logout

1. Usuario clica no nome na navbar
2. Abre menu com email + acao Logout
3. Ao confirmar logout, sessao e invalidada
4. Usuario e redirecionado para tela de login

## 9. Especificacao de UI

### 9.1 Tela de Login/Cadastro

Layout:

- Container horizontal com 3 quadrantes visuais
- Quadrante esquerda + centro funcionando como bloco unico de destaque
- Quadrante direita com card de autenticacao

Elementos no card:

- Alternador Login / Cadastro
- Campos de formulario conforme modo
- Botao principal de submit
- Sem opcao Esqueci minha senha nesta versao

Comportamento:

- Exibir erros de validacao por campo
- Exibir erro generico para falha de autenticacao
- Estado de loading durante submit

### 9.2 Layout da Area Autenticada

- Sidebar fixa a esquerda
- Navbar no topo
- Conteudo principal com Home

Sidebar:

- Item unico: Home

Navbar:

- Esquerda: Siao (link para Home)
- Direita: nome do usuario
- Menu do usuario:
	- email
	- logout

Home:

- Texto breve explicando o sistema
- Botao Cadastrar visitante (disabled ou sem handler funcional)
- Botao Vincular numero a crianca para salinha (disabled ou sem handler funcional)

## 10. Contratos de Camadas (Arquitetura)

### Controllers

Responsabilidades:

- receber request
- validar input com schema
- chamar service
- retornar response padronizada

Nao pode:

- usar Prisma direto
- ter regra de negocio

### Services

Responsabilidades:

- executar regras de negocio
- orquestrar validacoes e seguranca
- chamar repositories

### Repositories

Responsabilidades:

- encapsular acesso ao Prisma
- executar leitura/escrita de dados

## 11. Endpoints (propostos)

- POST /api/auth/sign-up
- POST /api/auth/sign-in
- POST /api/auth/sign-out
- GET /api/auth/session (opcional para validacao de sessao no cliente)

## 12. Estrutura de Arquivos (proposta)

src/modules/auth/

- schemas/
	- sign-in.schema.ts
	- sign-up.schema.ts
- repositories/
	- create-user.repository.ts
	- find-user-by-email.repository.ts
- services/
	- sign-up-auth.service.ts
	- sign-in-auth.service.ts
	- sign-out-auth.service.ts
- types/
	- auth.type.ts

src/app/api/auth/

- sign-up/route.ts
- sign-in/route.ts
- sign-out/route.ts

src/lib/

- auth.ts (helpers de sessao, validacao e middleware utilitario)

## 13. Criterios de Aceite

### CA-01 Cadastro com sucesso

Dado dados validos e email novo, quando cadastrar, entao usuario e criado com role ADMIN, senha em hash e sobrenome criptografado.

### CA-02 Bloqueio de email duplicado

Dado email existente, quando cadastrar, entao API retorna erro de conflito sem criar novo usuario.

### CA-03 Login com sucesso

Dado credenciais validas, quando logar, entao sistema cria sessao valida por ate 6h e redireciona para Home.

### CA-04 Falha de login

Dado credenciais invalidas, quando logar, entao sistema retorna erro de autenticacao sem revelar qual campo esta incorreto.

### CA-05 Protecao de rotas

Dado usuario nao autenticado, quando acessar rota privada, entao sistema redireciona para login.

### CA-06 Expiracao de sessao

Dado sessao com mais de 6h, quando houver nova requisicao protegida, entao sistema invalida sessao e redireciona para login.

### CA-07 Layout autenticado

Dado usuario logado, quando acessar Home, entao sidebar, navbar e conteudo basico devem aparecer conforme definido.

## 14. Riscos e Decisoes em Aberto

- Definir algoritmo final para criptografia de sobrenome (ex: AES-GCM com chave no ambiente)
- Definir estrategia de sessao (cookie httpOnly assinado, JWT com cookie, ou sessao server-side)
- Definir se cadastro faz auto login ou redireciona para login

## 15. Plano de Implementacao (ordem)

1. Criar schemas Zod de sign-in e sign-up
2. Criar model User no Prisma e migration
3. Criar repositories de usuario
4. Criar services de auth (sign-up, sign-in, sign-out)
5. Criar controllers em rotas API
6. Criar utilitarios de sessao em lib/auth.ts
7. Criar middleware/protecao para rotas privadas
8. Criar UI de login/cadastro
9. Criar layout autenticado (sidebar + navbar + home)
10. Validar criterios de aceite

