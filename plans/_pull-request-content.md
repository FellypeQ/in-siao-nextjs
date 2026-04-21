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

feature/spec-017-018-visitantes-baptized-exportacao

### Título do PR

feat: remove campo batizado e corrige exportacao de visitantes (SPEC 017/018)

### Descrição do PR

## Contexto

Implementacao conjunta das SPECs 017 e 018 para simplificar o fluxo de visitantes:

- remover o campo Batizado da experiencia de cadastro/edicao/detalhe
- garantir persistencia interna de `baptized = false`
- corrigir a exportacao Excel removendo a coluna "Tipo de Membro" e ajustando o header de data

## O que foi implementado

### Visitantes (cadastro/edicao/detalhe)

- Removido campo "Batizado" do formulario de visitantes (`visitante-form.tsx`).
- Removido envio de `baptized` no payload de criacao e atualizacao.
- Removida exibicao de "Batizado" no modal de detalhes do visitante.

### Camada de dominio (schemas/services/types)

- Removido `baptized` dos schemas Zod de criacao e atualizacao de visitante.
- Removido `baptized` dos tipos de input (`CreateVisitanteInput` e `UpdateVisitanteInput`).
- Services de criacao e atualizacao agora persistem `baptized: false` para o membro principal.

### Exportacao Excel de visitantes

- Removida coluna "Tipo de Membro" da aba "Todos os visitantes".
- Header da data alterado para "Data de cadastro" nas abas impactadas.
- Mantida a ordem das colunas remanescentes com reindexacao de asserts nos testes.

### Documentacao

- Atualizadas as SPECs:
  - `plans/017 - remover-campo-batizado-visitante.md`
  - `plans/018 - corrigir-exportacao-visitante.md`
    com status de execucao e checklist de entrega.

## Testes

- Testes atualizados em schema, service, route e UI de visitantes.
- Validacoes executadas durante a entrega:
  - `npx vitest run test/modules/visitantes/schemas/create-visitante.schema.test.ts test/modules/visitantes/schemas/update-visitante.schema.test.ts test/modules/visitantes/services/create-visitante.service.test.ts test/modules/visitantes/services/update-visitante.service.test.ts test/modules/visitantes/services/export-visitantes-excel.service.test.ts test/frontend/features/visitantes/components/visitante-form.test.tsx test/app/api/visitantes/route.test.ts test/app/api/visitantes/[id]/route.test.ts`
  - `npm run lint`

Observacao: o lint atual do projeto segue sem erros, apenas warnings preexistentes fora do escopo desta entrega.
