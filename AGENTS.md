# Diretrizes de Desenvolvimento do Projeto In-Sião (Next.js)

## Objetivo

Este documento define as regras, padrões arquiteturais e responsabilidades dos **agents (humanos ou IA)** que atuam no desenvolvimento do projeto **in-siao-nextjs**.

O objetivo é garantir:

* Consistência arquitetural
* Código previsível e testável
* Separação clara de responsabilidades
* Escalabilidade do sistema
* Facilidade de manutenção
* Padronização entre desenvolvedores e automações

Este projeto segue uma arquitetura baseada em **Services**, **Jobs** e **Modules**, com controllers finos e lógica de negócio centralizada.

---

# Stack Oficial do Projeto

## Runtime

* Node.js 22
* Next.js (App Router)
* TypeScript

## Frontend

* React
* MUI (Material UI)

## Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL

## Infraestrutura

* DevContainer
* Docker
* Supabase (produção)

## Validação e Formulários

* Zod
* React Hook Form

## Filas e Jobs (futuro)

* Redis
* BullMQ

---

# Princípios Arquiteturais

## 1) Controllers são finos

Controllers NÃO contêm lógica de negócio.

Eles apenas:

* Recebem requisição
* Validam entrada
* Chamam um service
* Retornam resposta

Controllers NUNCA:

* Acessam o banco diretamente
* Contêm regra de negócio
* Executam lógica complexa
* Chamam Prisma diretamente

Exemplo correto:

```ts
export async function POST(req: Request) {
  const body = await req.json()

  await createVisitanteService(body)

  return Response.json({ success: true })
}
```

---

## 2) Services contêm a lógica de negócio

Toda regra de negócio deve estar em um service.

Services:

* São funções únicas
* São assíncronos
* Orquestram operações
* Chamam repositories
* Disparam jobs
* Aplicam regras de negócio

Services são o coração do sistema.

---

## 3) Repositories acessam o banco

Somente repositories podem acessar o banco.

Eles encapsulam o Prisma.

Services NUNCA usam Prisma diretamente.

Exemplo:

```ts
export async function createVisitanteRepository(data: CreateVisitanteInput) {
  return prisma.visitante.create({
    data
  })
}
```

---

## 4) Jobs executam tarefas assíncronas

Jobs são usados para tarefas que não precisam ser síncronas.

Exemplos:

* Enviar WhatsApp
* Enviar e-mail
* Processar dados
* Integrações externas

Services disparam jobs.

Jobs executam a tarefa.

---

## 5) Funções únicas

Cada arquivo deve conter apenas uma função principal.

Exemplo:

```text
create-visitante.service.ts
list-visitantes.service.ts
send-whatsapp.job.ts
```

Nunca:

```text
visitante.service.ts
utils.service.ts
helpers.ts
```

---

# Estrutura de Pastas Oficial

```text
src/

  app/

    (public)/
      visitante/
        page.tsx

    (admin)/
      visitantes/
        page.tsx

    api/
      visitantes/
        route.ts

  modules/

    visitantes/

      services/
        create-visitante.service.ts
        list-visitantes.service.ts

      repositories/
        create-visitante.repository.ts
        list-visitantes.repository.ts

      jobs/
        send-whatsapp.job.ts

      schemas/
        visitante.schema.ts

      types/
        visitante.type.ts

  lib/
    prisma.ts
    auth.ts
    queue.ts

  jobs/
    worker.ts

  config/
    env.ts

  shared/

    errors/
    utils/
    constants/
```

---

# Regras de Nomeação

## Arquivos

Sempre usar:

```text
kebab-case
```

Exemplos:

```text
create-visitante.service.ts
send-whatsapp.job.ts
list-visitantes.repository.ts
```

---

## Services

Formato obrigatório:

```text
<action>-<entity>.service.ts
```

Exemplos:

```text
create-visitante.service.ts
update-visitante.service.ts
list-visitantes.service.ts
```

---

## Repositories

Formato obrigatório:

```text
<action>-<entity>.repository.ts
```

Exemplo:

```text
create-visitante.repository.ts
```

---

## Jobs

Formato obrigatório:

```text
<action>-<context>.job.ts
```

Exemplo:

```text
send-whatsapp.job.ts
```

---

# Fluxo Padrão de Execução

Sempre seguir:

```text
Request

Controller

Service

Repository

Database

Job (opcional)

Worker
```

---

# Regras de Validação

Toda validação deve usar:

```text
Zod
```

Sempre criar schema em:

```text
modules/<module>/schemas/
```

Exemplo:

```ts
export const createVisitanteSchema = z.object({
  nome: z.string(),
  telefone: z.string(),
  email: z.string().email()
})
```

---

# Regras de Banco de Dados

## ORM

Sempre usar:

```text
Prisma
```

Nunca acessar banco diretamente.

---

## Migrations

Sempre usar:

```bash
npx prisma migrate dev
```

Nunca editar banco manualmente.

---

## Prisma Client (obrigatório)

Sempre que houver qualquer atualização de banco, o agent deve executar:

```bash
npx prisma generate
```

Aplica para:

* alteração no `prisma/schema.prisma`
* criação/edição de migration
* mudança de enums, models, relações e constraints

Sem gerar o client, a feature não está pronta.

---

## Seeds

Seeds devem ficar em:

```text
prisma/seed.ts
```

---

# Regras de Ambiente

## Desenvolvimento

Banco local:

```text
PostgreSQL via DevContainer
```

---

## Produção

Banco:

```text
Supabase
```

---

## Variáveis de ambiente

Sempre usar:

```text
.env
```

Nunca:

```text
hardcode
```

---

# Regras de Código

## Sempre usar TypeScript

Nunca usar:

```text
any
```

---

## Sempre usar async/await

Nunca usar:

```text
.then
```

---

## Sempre usar funções puras quando possível

Evitar efeitos colaterais.

---

## Não usar lógica dentro de components

Components são apenas UI.

---

# Regras de UI

Sempre usar:

```text
MUI
```

Nunca misturar múltiplos frameworks de UI.

Em páginas Server Component (App Router), evitar passar função diretamente para Client Component via props.

Exemplo: evitar `component={Link}` direto em componentes MUI renderizados em Server Component.

Preferir:

* wrapper com `<Link>` envolvendo o componente visual
* ou mover a interação para um Client Component dedicado

---

# Regras de Segurança

Sempre validar:

* Input
* Permissões
* Autenticação

Nunca confiar no frontend.

---

# Regras de Autenticação

Toda rota protegida deve:

* Verificar sessão
* Verificar permissão

Responsável:

```text
lib/auth.ts
```

---

# Regras de Logs

Logs devem ser claros.

Sempre registrar:

* erros
* falhas
* operações críticas

---

# Regras de Erros

Sempre usar:

```text
Custom Errors
```

Nunca retornar erro genérico.

---

# Regras de Performance

Evitar:

* queries desnecessárias
* loops pesados
* processamento síncrono

Preferir:

* jobs
* paginação
* cache

---

# Regras de Testes (futuro)

Framework:

```text
Vitest
```

Testar:

* Services
* Repositories
* Validações

Nunca testar:

* UI primeiro

---

# Definition of Done (DoD)

Uma feature só está pronta quando:

* Service criado
* Repository criado
* Schema criado
* Migration criada
* `npx prisma generate` executado após mudanças de banco
* Controller criado
* Validação implementada
* Erros tratados
* Código tipado
* Testes automatizados da entrega passando

---

# Regras para Agents

Agents devem:

* Respeitar arquitetura
* Não violar separação de responsabilidades
* Não acessar banco fora de repository
* Não colocar lógica em controller
* Não criar código fora da estrutura definida
* Rodar `npx prisma generate` sempre que atualizar banco
* Executar testes e lint antes de concluir entrega
* Aplicar obrigatoriamente o padrão definido em `plans/_Orchestrator.md` para criar, revisar, atualizar e executar qualquer SPEC/PLAN

## Uso obrigatório do Orquestrador de Planos

Arquivo fonte oficial:

```text
plans/_Orchestrator.md
```

Regras obrigatórias para todo agent:

1. Sempre ler o orquestrador antes de iniciar qualquer trabalho que envolva SPEC/PLAN.
2. Toda nova SPEC deve nascer usando o template oficial do orquestrador.
3. Toda atualização de escopo deve refletir as seções definidas no orquestrador.
4. Toda entrega deve incluir atualização de `Status de Execucao` e `Checklist de Entrega` na SPEC.
5. Nenhum agent deve depender de menção manual desse arquivo no prompt para aplicar o padrão.

Se houver conflito entre uma SPEC e este arquivo, prevalece a arquitetura e as regras de qualidade definidas neste `AGENTS.md`, e a SPEC deve ser corrigida.

Checklist mínimo de saída do agent:

1. Banco atualizado (quando aplicável)
2. Prisma Client gerado
3. Testes passando
4. Lint sem erro
5. Critérios da SPEC atendidos

---

# Agents Específicos (quando necessário)

## Agent de Banco (Prisma)

Responsável por:

* modelagem Prisma
* migrations
* constraints e índices
* execução obrigatória de `npx prisma generate`

## Agent de API (Controller/Service/Repository)

Responsável por:

* schemas Zod
* services com regra de negócio
* repositories com Prisma
* rotas API finas e padronizadas

## Agent de UI (MUI + App Router)

Responsável por:

* páginas e componentes visuais
* integração com API
* evitar padrões que quebrem Server/Client boundaries
* testes de comportamento de UI

---

# Padrão de Criação de Feature

Sempre seguir esta ordem:

1. Criar schema
2. Criar repository
3. Criar service
4. Criar controller
5. Criar página
6. Testar fluxo

---

# Convenções Gerais

Sempre preferir:

* Código simples
* Código previsível
* Código explícito

Evitar:

* abstrações prematuras
* complexidade desnecessária
* lógica duplicada

---

# Missão do Projeto

O sistema existe para:

* Registrar visitantes
* Automatizar comunicação
* Organizar dados da igreja
* Facilitar gestão ministerial
* Permitir crescimento futuro

Toda decisão técnica deve respeitar essa missão.
