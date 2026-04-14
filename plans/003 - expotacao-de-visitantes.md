# SPEC 003 - Exportacao de Visitantes e Melhorias de UX de Cadastro

## 1. Contexto

Projeto: in-siao (Igreja Batista Siao)

Esta SPEC consolida quatro necessidades de produto identificadas apos a entrega da SPEC 002:

- exportar visitantes em Excel, incluindo visitante principal (dono do cadastro) e todos os familiares vinculados
- melhorar a experiencia de criacao de usuario com regras de senha explicitas e feedback visual em tempo real
- corrigir a experiencia de escolha de data de nascimento no web e no app
- corrigir o bug de timezone que exibe data de nascimento com dia anterior em listagem e detalhe

## 2. Objetivo de Negocio

Permitir extracao confiavel de dados ministeriais para uso administrativo (relatorios e acompanhamento), enquanto melhora a qualidade da experiencia de cadastro e garante consistencia de dados de nascimento sem erros de fuso horario.

## 3. Escopo

### 3.1 Em escopo

- Exportacao de visitantes em arquivo Excel (.xlsx)
- Inclusao de familiares no arquivo exportado
- Endpoint de exportacao com filtros basicos de data da exportacao (quando informado)
- Melhoria visual do formulario de cadastro de usuario para regras de senha
- Feedback visual de criterios da senha durante digitacao
- Padronizacao de input de data de nascimento com MUI DatePicker
- Correcao de serializacao/parsing de data de nascimento para evitar deslocamento de dia por timezone
- Ajuste de exibicao da data de nascimento na listagem e no detalhe de visitantes

### 3.2 Fora de escopo

- Exportacao em CSV, PDF ou integracoes externas (Google Sheets, BI)
- Filtros avancados de exportacao por todos os campos da entidade
- Agendamento automatico de exportacao por job/queue
- Alteracao de regras de negocio de parentesco
- Internacionalizacao completa de formatos de data para multiplos idiomas

## 4. Requisitos Funcionais

### RF-01 Exportar visitantes em Excel

O usuario autenticado deve conseguir exportar os visitantes em arquivo .xlsx.

### RF-02 Incluir dono do cadastro e familiares

A exportacao deve incluir o visitante principal e todos os familiares vinculados.

### RF-03 Estrutura de apresentacao no Excel

O arquivo deve ser gerado com duas abas:

- Aba 1: Visitantes (registro principal)
- Aba 2: Familiares por Visitante (um registro por familiar com referencia ao visitante principal)

### RF-04 Integridade de relacionamento na exportacao

Cada familiar exportado deve conter identificador do visitante principal para rastreabilidade.

### RF-05 Download via interface de visitantes

A tela de visitantes deve disponibilizar acao explicita de Exportar Excel.

### RF-06 Regras de senha visiveis no cadastro

Na criacao de usuario, a UI deve exibir criterios minimos de senha de forma explicita antes/durante o preenchimento.

### RF-07 Feedback visual da senha em tempo real

Durante digitacao da senha, cada criterio deve indicar status atendido/nao atendido sem necessidade de submit.

### RF-08 DatePicker para data de nascimento

Os formularios de visitante (novo e edicao) devem usar componente DatePicker da MUI para selecao de data de nascimento em web e app.

### RF-09 Data de nascimento sem deslocamento por timezone

Ao salvar, listar e detalhar, a data de nascimento deve manter o mesmo dia informado pelo usuario.

### RF-10 Compatibilidade com dados existentes

Registros ja existentes devem ser exibidos corretamente apos a correcao, sem regressao de dados.

## 5. Requisitos Nao Funcionais

### RNF-01 Arquitetura obrigatoria

Seguir padrao do projeto:

Request -> Controller -> Service -> Repository -> Database

Controllers sem regra de negocio e sem acesso direto ao Prisma.

### RNF-02 Validacao

Entradas de exportacao e cadastro devem ser validadas com Zod.

### RNF-03 Tipagem

Implementacao 100% TypeScript, sem any.

### RNF-04 Performance da exportacao

A exportacao deve suportar volume inicial do modulo sem travar UI; resposta deve iniciar download em tempo adequado para uso administrativo.

### RNF-05 Confiabilidade de datas

A camada de dominio deve tratar data de nascimento como data civil (sem horario), evitando parse implicito com fuso.

### RNF-06 Usabilidade

Feedbacks de validacao devem ser claros e imediatos, com mensagens objetivas.

### RNF-07 Qualidade

Entrega deve incluir testes automatizados e lint sem erro.

## 6. Modelagem de Dados (quando aplicavel)

Nao se aplica mudanca estrutural obrigatoria de schema nesta SPEC, desde que o modelo atual suporte data de nascimento sem perda semantica.

Decisao tecnica de dominio:

- tratar birthDate como data civil
- normalizar trafego entre camadas no formato ISO de data (AAAA-MM-DD) para evitar offset de timezone

Se durante implementacao for identificado impedimento tecnico no modelo atual, abrir ajuste de schema/migration como extensao controlada da SPEC (com prisma generate obrigatorio).

## 7. Fluxos Funcionais

### 7.1 Fluxo de exportacao Excel

1. Usuario acessa tela de visitantes
2. Usuario aciona botao Exportar Excel
3. Frontend chama endpoint de exportacao autenticado
4. Controller valida query (filtros opcionais)
5. Service busca visitantes e familiares relacionados
6. Service monta workbook .xlsx com duas abas
7. Controller retorna arquivo para download com headers corretos
8. Usuario baixa arquivo e visualiza dados consolidados

### 7.2 Fluxo de criacao de usuario com senha guiada

1. Usuario abre tela de cadastro
2. UI exibe checklist de criterios de senha
3. Usuario digita senha
4. Cada criterio muda visualmente para atendido/nao atendido em tempo real
5. Submit so permite avancar se schema validar todos os criterios

### 7.3 Fluxo de preenchimento de data de nascimento

1. Usuario abre formulario de visitante
2. Usuario seleciona data via MUI DatePicker
3. UI normaliza para data civil
4. Controller recebe payload validado
5. Service/repository persistem mantendo o dia informado
6. Listagem e detalhe exibem exatamente o mesmo dia selecionado

## 8. Contratos de Camadas (Arquitetura)

### Controllers

Responsabilidades:

- receber request de exportacao
- validar parametros com schema
- chamar service de exportacao
- retornar resposta binaria (.xlsx) com content-type e filename

Nao pode:

- usar Prisma direto
- montar regra de negocio de agrupamento familiar

### Services

Responsabilidades:

- orquestrar busca de visitantes e familiares
- montar estrutura tabular das abas
- aplicar regra de normalizacao de data civil
- gerar workbook para retorno ao controller

### Repositories

Responsabilidades:

- encapsular leitura de visitors + relacionamentos
- expor consulta otimizada para exportacao

## 9. Endpoints (quando aplicavel)

- GET /api/visitantes/export

Observacoes:

- endpoint protegido por sessao
- retorno com mime type de Excel
- nome de arquivo sugerido: visitantes-AAAA-MM-DD.xlsx

## 10. Estrutura de Arquivos (proposta)

src/modules/visitantes/

- schemas/
	- export-visitantes.schema.ts
- repositories/
	- list-visitantes-for-export.repository.ts
- services/
	- export-visitantes-excel.service.ts
- types/
	- export-visitantes.type.ts

src/app/api/visitantes/

- export/route.ts

src/frontend/features/visitantes/components/

- export-visitantes-button.tsx

src/frontend/features/auth/components/

- password-rules-checklist.tsx

src/modules/auth/schemas/

- sign-up.schema.ts (ajustes de mensagem e rastreio de criterios)

src/frontend/features/visitantes/components/

- visitante-form.tsx (adocao do MUI DatePicker)

## 11. Regras de Validacao

- Exportacao:
	- usuario autenticado obrigatorio
	- filtros opcionais validados por schema
- Senha de cadastro:
	- minimo 8 caracteres
	- ao menos 1 letra maiuscula
	- ao menos 1 letra minuscula
	- ao menos 1 numero
	- ao menos 1 caractere especial
- Data de nascimento:
	- obrigatoria
	- data valida
	- nao futura
	- trafego entre camadas no formato de data civil para evitar timezone drift

## 12. Criterios de Aceite

### CA-01 Download de Excel

Dado usuario autenticado na tela de visitantes, quando clicar em Exportar Excel, entao o sistema baixa um arquivo .xlsx valido.

### CA-02 Conteudo da aba de visitantes

Dado arquivo exportado, quando abrir a aba Visitantes, entao cada linha representa um visitante principal com seus campos administrativos.

### CA-03 Conteudo da aba de familiares

Dado arquivo exportado, quando abrir a aba Familiares por Visitante, entao cada familiar aparece em linha propria com referencia ao visitante principal.

### CA-04 Integridade de relacionamentos

Dado visitante com N familiares, quando exportar, entao os N familiares aparecem vinculados ao mesmo identificador do visitante principal.

### CA-05 Feedback de senha em tempo real

Dado tela de cadastro de usuario, quando a senha e digitada, entao cada criterio exibe status visual atualizado sem submit.

### CA-06 Bloqueio de senha fora da politica

Dado senha que nao cumpre criterios minimos, quando submeter cadastro, entao sistema bloqueia com mensagens claras de validacao.

### CA-07 DatePicker funcional

Dado formulario de visitante em web e app, quando selecionar data de nascimento, entao o componente de calendario e exibido corretamente e permite selecao sem friccao.

### CA-08 Consistencia de data sem timezone bug

Dado data informada como 14/03/2002, quando salvar e consultar em lista e detalhe, entao o sistema exibe 14/03/2002 (sem alterar para 13/03/2002).

### CA-09 Regressao controlada

Dado registros existentes, quando abrir lista/detalhe apos a entrega, entao nao ha regressao visual ou funcional nas datas de nascimento.

## 13. Riscos e Decisoes em Aberto

Decisoes fechadas nesta SPEC:

- formato de exportacao em duas abas para legibilidade e rastreabilidade
- padrao de data civil para eliminar deslocamento por timezone
- uso de MUI DatePicker para experiencia consistente

Riscos monitorados:

- volume alto de exportacao pode exigir estrategia futura de stream/chunk
- possivel necessidade de ajuste de adaptador/localizacao do DatePicker conforme ambiente

## 14. Plano de Implementacao (ordem)

1. Criar schema de entrada para endpoint de exportacao
2. Criar repository para leitura otimizada de visitantes + familiares
3. Criar service de geracao de workbook Excel
4. Criar endpoint GET /api/visitantes/export
5. Adicionar botao de exportacao na UI de visitantes
6. Implementar componente de checklist visual de regras de senha
7. Integrar checklist ao formulario de sign-up
8. Migrar input de data de nascimento para MUI DatePicker no formulario de visitante
9. Ajustar serializacao/parsing de data nas camadas para padrao data civil
10. Corrigir exibicao de data em listagem e detalhe
11. Criar/atualizar testes (schema, service, endpoint e UI)
12. Executar lint e testes
13. Validar criterios de aceite

## 15. Estrategia de Testes

### 15.1 Unitarios

- schema de exportacao
- regras de senha (criterios)
- normalizacao de data civil

### 15.2 Integracao

- endpoint de exportacao retornando arquivo e headers corretos
- service de exportacao com visitante sem familiares e com familiares
- consulta de repository para relacionamento principal/familiares

### 15.3 UI

- botao de exportacao dispara requisicao e fluxo de download
- checklist de senha atualiza em tempo real durante digitacao
- DatePicker renderiza e permite selecao de data no formulario
- listagem e detalhe exibem data correta sem off-by-one

### 15.4 Regressao

- validar casos existentes da SPEC 002 afetados por data de nascimento
- validar fluxo de cadastro/login apos ajuste de UX de senha

## Status de Execucao

- Estado: Concluido
- Responsavel: GitHub Copilot
- Ultima atualizacao: 2026-04-14

### Checklist de Entrega

- [x] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado
- [x] UI criada/atualizada (quando aplicavel)
- [ ] Migration criada (quando aplicavel)
- [ ] npx prisma generate executado (quando aplicavel)
- [x] Testes adicionados/atualizados
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados
