# SPEC 002 - Cadastro de Visitante

## 1. Contexto

Projeto: in-siao (Igreja Batista Siao)

Objetivo desta SPEC: definir o modulo de cadastro e gestao inicial de visitantes, incluindo:

- modelagem de membros e dados complementares de visitante
- cadastro de visitante com pedidos de oracao e familiares
- listagem paginada dos visitantes mais recentes
- visualizacao em modal e fluxo de edicao

Este modulo prepara a base de dados ministerial para acompanhamento de visitantes e seus vinculos familiares.

## 2. Objetivo de Negocio

Permitir que a equipe da igreja registre visitantes de forma estruturada, com dados de contato, contexto religioso, origem de conhecimento da igreja, pedidos de oracao e relacoes familiares, viabilizando acompanhamento pastoral e organizacao de dados.

## 3. Escopo

### 3.1 Em escopo

- Criacao da tabela principal de membros (members)
- Criacao da tabela de dados especificos de visitante (member_visitors)
- Criacao da tabela de pedidos de oracao (prays)
- Criacao da tabela de associacao entre membro e pedido de oracao (member_prays)
- Criacao da tabela de relacionamento familiar entre membros (member_relationships)
- Tela de cadastro de visitante
- Inclusao dinamica de membros familiares no mesmo fluxo
- Tela de listagem de visitantes com ordenacao por mais recente
- Paginacao da listagem (20 por pagina)
- Modal de visualizacao de detalhes
- Fluxo de edicao com o mesmo layout da tela de cadastro

### 3.2 Fora de escopo

- Exclusao de visitante
- Vinculo de visitantes com celulas/ministerios
- Historico de visitas e follow-up avancado
- Importacao em lote
- Filtros avancados na listagem

## 4. Requisitos Funcionais

### RF-01 Cadastro de visitante

O usuario deve conseguir cadastrar um novo visitante com os campos obrigatorios de membro e dados complementares de visitante.

### RF-02 Dados obrigatorios basicos

No cadastro principal, devem ser obrigatorios:

- nome completo
- data de nascimento

Telefone e opcional.

### RF-03 Tipo de membro

Todo cadastro feito pelo fluxo de visitante deve criar member com type igual a VISITOR.

Esta regra tambem vale para membros familiares criados dentro do mesmo fluxo.

### RF-04 Situacao de batismo

O cadastro deve registrar baptized como booleano (true ou false).

O campo deve ser exibido no formulario inicial para escolha explicita do usuario.

### RF-05 Igreja/comunidade atual

O usuario deve informar se frequenta igreja/comunidade religiosa, com opcoes padronizadas em enum.

### RF-06 Como conheceu a igreja

O usuario deve informar como conheceu a igreja, com opcoes padronizadas em enum.

### RF-07 Resposta livre para opcao Other

Quando how_know for OTHER, o campo how_know_other_answer passa a ser obrigatorio.

### RF-08 Pedido de oracao

O usuario deve conseguir registrar um texto livre de pedido de oracao no fluxo de cadastro.

### RF-09 Inclusao de familiares

O usuario deve conseguir adicionar multiplos membros familiares no mesmo formulario, em blocos dinamicos, contendo:

- nome completo (obrigatorio)
- data de nascimento (obrigatorio)
- telefone (opcional)
- grau de parentesco (obrigatorio)

Nao ha limite maximo de familiares por cadastro.

### RF-10 Persistencia de relacionamento familiar

Cada familiar criado deve ficar relacionado ao visitante principal por meio da tabela member_relationships.

### RF-11 Listagem de visitantes

A tela de listagem deve exibir visitantes ordenados por mais recente, com limite de 20 registros por pagina.

### RF-12 Visualizacao em modal

Ao clicar em um visitante na listagem, abrir modal com dados detalhados e botoes Fechar e Editar.

### RF-13 Edicao de visitante

Ao clicar em Editar no modal, navegar para tela de edicao com mesmo layout do cadastro, preenchida com os dados atuais.

A edicao de familiares deve operar em diff incremental.

Para cada familiar relacionado na edicao, devem existir duas acoes:

- Desvincular
- Excluir

### RF-14 Restricao de exclusao

Nao deve existir opcao de exclusao nesta versao.

### RF-15 Acoes finais do formulario

Na tela de cadastro/edicao devem existir os botoes:

- Cancelar
- Salvar
- Salvar e adicionar outro

## 5. Requisitos Nao Funcionais

### RNF-01 Arquitetura obrigatoria

Seguir padrao do projeto:

Request -> Controller -> Service -> Repository -> Database

Controllers sem regra de negocio e sem acesso direto ao Prisma.

### RNF-02 Validacao

Toda entrada deve ser validada com Zod em modules/visitantes/schemas.

### RNF-03 Tipagem

Implementacao 100% TypeScript, sem any.

### RNF-04 Padrao de UI

Tela implementada com MUI e responsiva para desktop e mobile.

### RNF-05 Integridade transacional

Cadastro principal, dados de visitante, pedidos de oracao e familiares devem ser persistidos em transacao unica para evitar estado parcial.

### RNF-06 Testes obrigatorios

Todo codigo desenvolvido nesta SPEC deve ser entregue com testes automatizados correspondentes.

Regras minimas:

- Schema Zod novo ou alterado deve ter teste unitario de validacao
- Service novo ou alterado deve ter teste unitario cobrindo fluxo feliz e erros de regra de negocio
- Repository novo ou alterado deve ter teste de integracao com Prisma (ou mock estruturado quando integracao nao for viavel no contexto do teste)
- Endpoint novo ou alterado deve ter teste de integracao do contrato HTTP
- Componente/tela nova ou alterada deve ter teste de renderizacao e comportamento critico (submit, validacao, estados de loading/erro)

## 6. Modelagem de Dados

### 6.1 Tabela members

Entidade central de pessoas da igreja (visitante, frequentador ou membro).

Campos minimos:

- id
- name (obrigatorio)
- birth_date (obrigatorio)
- document (obrigatorio para membros internos; opcional/oculto no fluxo de visitante)
- phone (nullable)
- type (enum)
- baptized (boolean)
- created_at
- updated_at

Enum proposto para members.type:

- VISITOR
- REGULAR_ATTENDEE
- MEMBER

Regras de unicidade:

- document unico quando informado
- indice/constraint de unicidade composta em (name, birth_date)

### 6.2 Tabela member_visitors

Dados especificos para membros com perfil de visitante.

Campos:

- id
- member_id (FK unica para members.id)
- actual_church (enum)
- how_know (enum)
- how_know_other_answer (nullable)
- created_at
- updated_at

Enum proposto para actual_church:

- NONE
- EVANGELICAL
- CATHOLIC
- OTHER
- NO_REPORT

Enum proposto para how_know:

- FRIEND_OR_FAMILY_REFERRAL
- SOCIAL_MEDIA
- WALK_IN
- EVENT
- GOOGLE_SEARCH
- OTHER

Regra:

- how_know_other_answer obrigatorio apenas quando how_know = OTHER.

### 6.3 Tabela prays

Armazena pedidos de oracao em texto livre.

Campos:

- id
- text
- created_at
- updated_at

### 6.4 Tabela member_prays

Tabela de associacao entre membros e pedidos de oracao.

Campos:

- member_id (FK)
- pray_id (FK)
- created_at

Regra de chave:

- chave primaria composta (member_id, pray_id)

### 6.5 Tabela member_relationships

Relaciona dois membros, representando vinculo familiar.

Campos:

- id
- principal_member_id (FK -> members.id)
- related_member_id (FK -> members.id)
- relationship_type (enum)
- created_at
- updated_at

Enum proposto para relationship_type:

- SPOUSE
- CHILD
- FATHER
- MOTHER
- SIBLING
- GRANDPARENT
- GRANDCHILD
- UNCLE_AUNT
- COUSIN
- OTHER

Regras:

- impedir auto-relacionamento (principal_member_id diferente de related_member_id)
- permitir multiplos familiares por membro principal

## 7. Mapeamento de Labels (UI -> Enum)

Voce ja frequenta alguma igreja ou comunidade religiosa?

- Nao frequento nenhuma -> NONE
- Igreja evangelica -> EVANGELICAL
- Igreja catolica -> CATHOLIC
- Outra religiao -> OTHER
- Prefiro nao responder -> NO_REPORT

Como voce conheceu nossa igreja?

- Indicacao de amigos/familia -> FRIEND_OR_FAMILY_REFERRAL
- Redes sociais -> SOCIAL_MEDIA
- Passei na frente -> WALK_IN
- Evento -> EVENT
- Google -> GOOGLE_SEARCH
- Outra -> OTHER

## 8. Fluxos Funcionais

### 8.1 Fluxo de cadastro de visitante

1. Usuario clica em Cadastrar visitante
2. Sistema navega para tela de novo visitante
3. Usuario preenche dados obrigatorios e opcionais
4. Usuario pode adicionar 0..N familiares por botao Adicionar membro familiar
5. Controller valida payload com schema Zod
6. Service aplica regras de negocio
7. Repository persiste dados em transacao:
	 - cria member principal (type VISITOR)
	 - cria member_visitor
	 - cria pray (se informado) e member_pray
	 - cria members familiares (todos com type VISITOR)
	 - cria member_relationships
8. Sistema retorna sucesso
9. Acao final:
	 - Salvar: volta para listagem ou detalhe
	 - Salvar e adicionar outro: limpa formulario para novo cadastro

### 8.2 Fluxo de listagem

1. Usuario acessa tela de visitantes
2. Sistema busca visitors ordenados por created_at desc
3. Exibe 20 itens por pagina
4. Usuario troca pagina para navegar nos registros antigos

### 8.3 Fluxo de visualizacao por modal

1. Usuario clica em um item da listagem
2. Sistema abre modal com dados completos
3. Modal apresenta botoes Fechar e Editar

### 8.4 Fluxo de edicao

1. Usuario clica em Editar no modal
2. Sistema navega para tela de edicao
3. Formulario carrega com dados existentes
4. Usuario atualiza informacoes
5. Controller valida schema de update
6. Service atualiza dados relacionados por diff incremental:
	- cria novos familiares adicionados
	- atualiza familiares existentes
	- desvincula familiar sem excluir registro quando solicitado
	- exclui familiar quando solicitado
7. Sistema salva e retorna para listagem/detalhe

## 9. Especificacao de UI

### 9.1 Tela de cadastro/edicao de visitante

Campos do visitante principal:

- Nome completo (texto, obrigatorio)
- Data de nascimento (date, obrigatorio)
- Telefone/WhatsApp (texto, opcional)
- Batizado? (select Sim/Nao, obrigatorio)
- Voce ja frequenta alguma igreja ou comunidade religiosa? (select, obrigatorio)
- Como voce conheceu nossa igreja? (select, obrigatorio)
- Campo Outra resposta (texto, condicional quando how_know = OTHER)
- Gostariamos que orasemos por algum motivo especial? (textarea, opcional)

Bloco de familiares:

- Botao Adicionar membro familiar deve permanecer sempre disponivel ao final
- Sem limite maximo de familiares
- Cada clique adiciona novo bloco com:
	- Nome completo
	- Data de nascimento
	- Telefone (opcional)
	- Grau de parentesco

Na edicao:

- cada familiar listado deve oferecer acao de Desvincular
- cada familiar listado deve oferecer acao de Excluir

Acoes de rodape:

- Cancelar
- Salvar
- Salvar e adicionar outro

### 9.2 Tela de listagem de visitantes

- Lista em ordem de cadastro mais recente
- Exibe ultimos 20 por pagina
- Paginacao para navegar
- Clique em item abre modal de detalhe

### 9.3 Modal de detalhe

- Exibe dados pessoais, dados de visitante, pedido de oracao e familiares
- Botao Fechar
- Botao Editar

## 10. Contratos de Camadas (Arquitetura)

### Controllers

Responsabilidades:

- receber request
- validar input com schema
- chamar service
- retornar response

Nao pode:

- usar Prisma direto
- conter regra de negocio

### Services

Responsabilidades:

- orquestrar cadastro/edicao/listagem
- garantir regras condicionais de enum
- abrir transacao para persistencia atomica
- chamar repositories

### Repositories

Responsabilidades:

- encapsular acesso ao Prisma
- realizar CRUD das tabelas members, member_visitors, prays, member_prays e member_relationships

## 11. Endpoints (propostos)

- POST /api/visitantes
- GET /api/visitantes?page=1&limit=20
- GET /api/visitantes/:id
- PUT /api/visitantes/:id

Nao incluir endpoint de delete nesta SPEC.

## 12. Estrutura de Arquivos (proposta)

src/modules/visitantes/

- schemas/
	- create-visitante.schema.ts
	- update-visitante.schema.ts
	- list-visitantes.schema.ts
- repositories/
	- create-member.repository.ts
	- create-member-visitor.repository.ts
	- create-pray.repository.ts
	- create-member-pray.repository.ts
	- create-member-relationship.repository.ts
	- list-visitantes.repository.ts
	- find-visitante-by-id.repository.ts
	- update-visitante.repository.ts
- services/
	- create-visitante.service.ts
	- list-visitantes.service.ts
	- get-visitante-detail.service.ts
	- update-visitante.service.ts
- types/
	- visitante.type.ts

src/app/api/visitantes/

- route.ts (POST, GET)
- [id]/route.ts (GET, PUT)

src/app/(admin)/visitantes/

- page.tsx (listagem)
- novo/page.tsx (cadastro)
- [id]/editar/page.tsx (edicao)

## 13. Regras de Validacao

- name: string nao vazia
- birth_date: data valida e nao futura
- document: string opcional no fluxo de visitante; quando informado deve ser unico
- phone: string opcional
- type: no create por tela de visitante deve ser fixo VISITOR para principal e familiares
- baptized: boolean obrigatorio
- actual_church: enum obrigatorio
- how_know: enum obrigatorio
- how_know_other_answer: obrigatorio quando how_know = OTHER
- pray text: opcional, com limite de tamanho (definir ex: 1000 chars)
- familiares: array opcional, mas se item existir deve validar campos obrigatorios
- nome + data de nascimento: validar unicidade composta no banco

## 14. Criterios de Aceite

### CA-01 Cadastro basico de visitante

Dado formulario valido, quando salvar, entao visitor e criado em members + member_visitors com sucesso.

### CA-02 Campo condicional Other

Dado how_know = OTHER sem texto complementar, quando salvar, entao sistema bloqueia com erro de validacao.

### CA-03 Cadastro com pedido de oracao

Dado texto de oracao informado, quando salvar, entao sistema cria pray e vincula em member_prays.

### CA-04 Cadastro com familiares

Dado familiares informados, quando salvar, entao sistema cria members familiares e seus member_relationships com o principal.

### CA-04.1 Familiares sem limite

Dado formulario de cadastro, quando adicionar familiares, entao o sistema permite adicionar quantos blocos forem necessarios.

### CA-05 Listagem paginada

Dado mais de 20 visitantes, quando abrir listagem, entao sistema exibe 20 por pagina ordenados por mais recente.

### CA-06 Visualizacao em modal

Dado clique em item da listagem, quando abrir modal, entao dados completos sao exibidos com botoes Fechar e Editar.

### CA-07 Edicao sem exclusao

Dado visitante existente, quando editar e salvar, entao dados sao atualizados e nao existe opcao de exclusao.

Observacao: esta restricao vale para exclusao do visitante principal. Na edicao de familiares, devem existir acoes de desvincular e excluir familiar.

### CA-07.1 Edicao incremental de familiares

Dado visitante com familiares, quando editar, entao o sistema aplica diff incremental (adicionar, atualizar, desvincular ou excluir familiar) sem substituir toda a lista automaticamente.

### CA-07.2 Prevencao de duplicidade de membro

Dado tentativa de criar membro com mesmo nome e data de nascimento, quando salvar, entao sistema deve bloquear por unicidade composta.

### CA-07.3 Unicidade de document

Dado document informado, quando salvar, entao sistema deve bloquear duplicidade de document.

### CA-08 Cobertura de testes da entrega

Dado o desenvolvimento da SPEC 002, quando concluir a entrega, entao todas as pecas implementadas (schema, service, repository, endpoint e UI) devem possuir testes automatizados coerentes com o comportamento entregue.

### CA-09 Bloqueio de merge sem testes

Dado alteracoes de codigo da SPEC 002, quando abrir PR, entao nao deve ser considerado pronto se houver funcionalidades novas/alteradas sem testes correspondentes.

## 15. Riscos e Decisoes em Aberto

Sem pendencias abertas nesta fase para os itens acima: decisoes fechadas e incorporadas nesta SPEC.

## 16. Plano de Implementacao (ordem)

1. Criar enums e modelos no Prisma para as 5 tabelas
2. Gerar migration da SPEC 002
3. Criar schemas Zod de create/update/list
4. Criar repositories por acao
5. Criar services de create/list/detail/update
6. Criar controllers em routes API
7. Criar tela de listagem + modal de detalhe
8. Criar tela de novo cadastro com familiares dinamicos
9. Criar tela de edicao reaproveitando layout de cadastro
10. Implementar testes de schema, service, repository, endpoint e UI conforme escopo entregue
11. Executar suite de testes e corrigir falhas
12. Validar criterios de aceite

## 17. Estrategia de Testes (obrigatoria)

### 17.1 Camadas e foco

- Unitario (rapido): schemas e services
- Integracao (medio): repositories e endpoints
- Componente (UI): formularios, listagem, modal e fluxo de edicao

### 17.2 Casos minimos por fluxo

- Cadastro com sucesso (com e sem familiares)
- Validacao condicional de how_know = OTHER
- Persistencia de pedido de oracao e vinculo
- Listagem ordenada e paginada
- Abertura de modal e navegacao para edicao
- Edicao com salvamento e diff incremental de familiares
- Acoes de desvincular e excluir familiar
- Bloqueio de duplicidade por document
- Bloqueio de duplicidade por nome + data de nascimento
- Garantia de ausencia de exclusao

### 17.3 Politica de qualidade para PR

- Nao aprovar entrega com comportamento novo sem teste
- Nao remover testes existentes sem justificativa tecnica
- Corrigir teste quebrado na mesma entrega que alterou o comportamento
