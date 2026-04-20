# SPEC 007 - Home de Visitantes

## 1. Contexto

A rota `/visitantes` exibe diretamente a listagem de visitantes. A evolução do módulo demanda uma página inicial que centralize as ações disponíveis ao usuário com base em permissões e ofereça uma visão temporal dos cadastros. A listagem é migrada para uma sub-rota dedicada.

## 2. Objetivo de Negocio

Transformar `/visitantes` em uma home do módulo com cards de ação e gráfico de cadastros por dia, movendo a listagem para `/visitantes/listagem`.

## 3. Escopo

### 3.1 Em escopo

- Converter `/visitantes/page.tsx` em home com cards e gráfico
- Criar `/visitantes/listagem/page.tsx` com a listagem existente
- Card "Cadastrar Visitante" — visível com permissão `VISITANTES_CADASTRAR`
- Card "Listar Visitantes" — visível com permissão `VISITANTES_LISTAR`
- Gráfico de linha (MUI X Charts) com contagem de visitantes cadastrados por dia nos últimos 60 dias — visível para todos os usuários autenticados (dado agregado sem PII)
- Home de visitantes e item do menu lateral acessíveis para qualquer usuário com ao menos uma permissão do módulo (`VISITANTES_CADASTRAR`, `VISITANTES_LISTAR`, `VISITANTES_EDITAR`, `VISITANTES_EXCLUIR`, `VISITANTES_EXPORTAR`)
- Após salvar visitante sem permissão `VISITANTES_LISTAR`, redirecionar para `/visitantes` (home)

### 3.2 Fora de escopo

- Card de mensagens (SPEC 009)
- Filtros de data no gráfico via UI (spec futura)
- Alterações no formulário de cadastro de visitante
- Alterações nas rotas `/visitantes/novo` e `/visitantes/[id]/editar`

## 4. Requisitos Funcionais

- **RF-01**: A rota `/visitantes` exibe a home com cards de ação e gráfico, não a listagem diretamente
- **RF-02**: Card "Cadastrar Visitante" aparece somente para usuários com `VISITANTES_CADASTRAR`
- **RF-03**: Card "Listar Visitantes" aparece somente para usuários com `VISITANTES_LISTAR`
- **RF-04**: Gráfico de linha exibe contagem de visitantes cadastrados por dia nos últimos 60 dias, visível para todos os usuários autenticados, independente de permissão
- **RF-05**: A listagem atual é acessível em `/visitantes/listagem`, protegida por `VISITANTES_LISTAR`
- **RF-06**: Após salvar visitante, se o usuário não tiver `VISITANTES_LISTAR`, o redirect vai para `/visitantes`
- **RF-07**: A home `/visitantes` e o item "Visitantes" no menu lateral são exibidos para qualquer usuário autenticado com ao menos uma permissão do módulo de visitantes

## 5. Requisitos Nao Funcionais

- **RNF-01**: Instalar e usar `@mui/x-charts` para o gráfico
- **RNF-02**: Gráfico responsivo (`width: "100%"` ou via `sx`)
- **RNF-03**: Dados do gráfico buscados via API — não embutidos no componente
- **RNF-04**: Cards usam componente MUI `Card` com layout grid responsivo

## 6. Modelagem de Dados (quando aplicavel)

Sem alteração de schema Prisma. O endpoint de gráfico usa `createdAt` do model `Member` existente, agrupando por dia via query Prisma.

## 7. Fluxos Funcionais

### Fluxo 1 — Acesso à home

1. `requireAuthSession()` protege a página; verifica que o usuário tem ao menos uma permissão do módulo de visitantes
2. `VisitantesHomeView` recebe `permissions` do usuário
3. View exibe os cards conforme as permissões
4. Busca `GET /api/visitantes/chart` e renderiza gráfico (todos os usuários autenticados com acesso à home)
5. Card "Listar" oculto sem `VISITANTES_LISTAR`; card "Cadastrar" oculto sem `VISITANTES_CADASTRAR`

### Fluxo 2 — Cadastro de visitante sem `VISITANTES_LISTAR`

1. Usuário preenche e salva o formulário
2. `POST /api/visitantes` retorna sucesso (201)
3. Frontend redireciona para `/visitantes` (home)

### Fluxo 3 — Acesso à listagem

1. `/visitantes/listagem/page.tsx` verifica `VISITANTES_LISTAR`
2. Renderiza a listagem existente (componente já implementado)

## 8. Contratos de Camadas (Arquitetura)

### GET /api/visitantes/chart
- **Controller** (`api/visitantes/chart/route.ts`): valida sessão (sem permissão específica), chama service, retorna JSON
- **Service** (`get-visitantes-chart-data.service.ts`): define range (últimos 60 dias em timezone -3), chama repository
- **Repository** (`get-visitantes-chart-data.repository.ts`): query Prisma `groupBy` ou `findMany` agrupando `createdAt` por dia no intervalo, ajustado para UTC-3

## 9. Endpoints (quando aplicavel)

### GET /api/visitantes/chart

**Guard**: sessão válida (sem permissão específica — gráfico é dado agregado sem PII)

**Query params**: nenhum nesta SPEC (range fixo = últimos 60 dias em timezone -3)

**Response 200**:
```json
[
  { "date": "2026-03-22", "count": 5 },
  { "date": "2026-03-23", "count": 3 }
]
```

**Response 401**: sem sessão

## 10. Estrutura de Arquivos (proposta)

```
src/
  app/
    (web_pages)/
      visitantes/
        page.tsx                              ← home (cards + gráfico) [MODIFICADO]
        listagem/
          page.tsx                            ← listagem migrada [NOVO]
    api/
      visitantes/
        chart/
          route.ts                            ← [NOVO]

  frontend/
    features/
      visitantes/
        components/
          visitantes-home-view.tsx            ← [NOVO]
          visitantes-list-view.tsx            ← [NOVO] wrapper da listagem para a página /listagem

  modules/
    visitantes/
      services/
        get-visitantes-chart-data.service.ts  ← [NOVO]
      repositories/
        get-visitantes-chart-data.repository.ts ← [NOVO]

test/
  app/
    api/
      visitantes/
        chart/
          route.test.ts                       ← [NOVO]
  modules/
    visitantes/
      services/
        get-visitantes-chart-data.service.test.ts ← [NOVO]
  frontend/
    features/
      visitantes/
        components/
          visitantes-home-view.test.tsx       ← [NOVO]
```

## 11. Regras de Validacao

- `GET /api/visitantes/chart` requer sessão válida — sem permissão específica
- Range do gráfico: fixo, `hoje - 60 dias` até `hoje` em timezone -3 (UTC-3); calculado no service, não no frontend
- Agrupamento por dia usa offset de -3h em relação ao UTC para consistência com a exibição de "data de cadastro" na aplicação
- Redirect pós-cadastro: verificado no frontend com base no array `permissions` da sessão retornada via prop do Server Component
- Home `/visitantes` exige ao menos uma permissão do módulo; sem nenhuma, usuário é redirecionado para outra rota (ex: `/`)

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado usuário autenticado com ao menos uma permissão do módulo, quando acessa `/visitantes`, então vê a home com cards e gráfico (não a listagem diretamente)
- **CA-02** (RF-02): Dado usuário sem `VISITANTES_CADASTRAR`, quando acessa home, então o card "Cadastrar Visitante" não aparece
- **CA-03** (RF-03): Dado usuário sem `VISITANTES_LISTAR`, quando acessa home, então o card "Listar Visitantes" não aparece
- **CA-04** (RF-04): Dado usuário autenticado com ao menos uma permissão do módulo, quando acessa home, então o gráfico é exibido independente de qual permissão possui
- **CA-05** (RF-04): Dado gráfico exibido, então cobre os últimos 60 dias em timezone -3
- **CA-06** (RF-05): Dado usuário com `VISITANTES_LISTAR`, quando acessa `/visitantes/listagem`, então vê a listagem
- **CA-07** (RF-06): Dado usuário sem `VISITANTES_LISTAR`, quando salva visitante com sucesso, então é redirecionado para `/visitantes` (home)
- **CA-08** (RF-07): Dado usuário com ao menos uma permissão do módulo de visitantes, quando visualiza o menu lateral, então o item "Visitantes" está visível

## 13. Riscos e Decisoes em Aberto

- **Decisão**: Gráfico visível para todos os usuários autenticados com acesso à home — dado agregado sem PII; sem necessidade de guard de permissão específica
- **Decisão**: Range fixo de 60 dias — filtros de data via UI fora de escopo desta SPEC
- **Decisão**: Home acessível somente para usuários com ao menos uma permissão do módulo de visitantes; menu lateral exibe "Visitantes" nessa condição
- **Decisão**: Instalar `@mui/x-charts`
- **Decisão**: Timezone -3 (UTC-3) para agrupamento por dia — consistente com a forma como "data de cadastro" é exibida na aplicação

## 14. Plano de Implementacao (ordem)

1. Verificar e instalar `@mui/x-charts` se necessário
2. Criar repository `get-visitantes-chart-data.repository.ts`
3. Criar service `get-visitantes-chart-data.service.ts`
4. Criar controller `api/visitantes/chart/route.ts`
5. Criar `visitantes-home-view.tsx` (cards + gráfico)
6. Criar `visitantes-list-view.tsx` (wrapper da listagem para nova rota)
7. Criar `/visitantes/listagem/page.tsx`
8. Atualizar `/visitantes/page.tsx` para renderizar home view
9. Atualizar redirect pós-cadastro no `visitante-form.tsx` (verificar permissão `VISITANTES_LISTAR`)
10. Escrever testes
11. `npx vitest run` — sem falhas
12. Lint sem erro

## 15. Estrategia de Testes

- **Service** `get-visitantes-chart-data`: happy path (retorna array com datas e contagens), range de 60 dias calculado corretamente em timezone -3, retorna array vazio se não há cadastros no período
- **Controller** `chart/route.ts`: 200 com dados válidos para qualquer usuário autenticado, 401 sem sessão (sem caso de 403 por permissão)
- **UI** `visitantes-home-view`: renderiza gráfico para todos com acesso à home, renderiza card "Cadastrar" com `VISITANTES_CADASTRAR`, oculta card sem permissão, renderiza card "Listar" com `VISITANTES_LISTAR`, oculta card sem permissão

## Aprendizados Operacionais (Pos-mortem)

1. **Mock de `AppError` necessário para testes de 401**: lançar um `Error` simples com propriedades extras (`statusCode`, `code`) não é suficiente — `toErrorResponse` verifica `instanceof AppError`. O mock de sessão que simula falha de autenticação deve lançar `new AppError("...", 401, "UNAUTHORIZED")` para o status HTTP ser 401 e não 500.

2. **`vi.mock` não substitui o mock do `beforeEach` sem redefinição**: ao usar `vi.clearAllMocks()` no `beforeEach`, o mock retorna ao comportamento padrão definido no `vi.mock()`. Para testes que sobrescrevem o comportamento (ex: `mockRejectedValueOnce`), importar a função mockada no topo do arquivo e usar `vi.mocked()` é mais seguro e explícito do que dynamic `import()` dentro do teste.

3. **Sidebar já estava implementada corretamente**: o `authenticated-shell.tsx` já tinha a lógica `canOpenVisitantesModule` cobrindo todas as permissões do módulo — nenhuma alteração necessária na SPEC 007. Confirmar estado do código existente antes de incluir itens no plano de implementação evita trabalho redundante.

4. **`Read` obrigatório antes de `Edit`**: a ferramenta `Edit` exige que o arquivo tenha sido lido via `Read` na conversa atual, mesmo que o conteúdo tenha sido retornado por outro agente. Arquivos trazidos por `Agent/Explore` não contam como "lidos" para esse fim.

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `Claude`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [x] Schema criado/atualizado — não aplicável (sem alteração de banco)
- [x] Repository criado/atualizado — `get-visitantes-chart-data.repository.ts`
- [x] Service criado/atualizado — `get-visitantes-chart-data.service.ts`
- [x] Controller/route criado/atualizado — `api/visitantes/chart/route.ts`
- [x] UI criada/atualizada — `visitantes-home-view.tsx`, `/visitantes/page.tsx` (home), `/visitantes/listagem/page.tsx`, `visitante-form.tsx` (redirect), `novo/page.tsx`, `editar/page.tsx`
- [x] Migration criada — não aplicável
- [x] `npx prisma generate` executado — não aplicável
- [x] Testes adicionados/atualizados — 13 novos testes (service, controller, UI)
- [x] Testes passando — 93/93
- [x] Lint sem erro
- [x] Criterios de aceite validados
