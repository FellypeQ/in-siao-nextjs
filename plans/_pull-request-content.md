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

feature/spec-013-cascade-delete-banco-limpeza-repositories

### Título do PR

feat: implementa cascade delete no banco e limpeza de repositories (SPEC 013)

### Descrição do PR

## Contexto

Implementacao da SPEC 013 para consolidar exclusoes em cascata no banco, remover logica redundante em repositories e garantir a exclusao transacional de familiares orfaos ao excluir visitantes.

## O que foi implementado

### Contrato de banco para onDelete ausente

- Atualizado o `prisma/schema.prisma` para explicitar `onDelete: SetNull` em relacoes com `User` que estavam sem contrato explicito.
- Tornados nullable os campos necessarios para compatibilidade com `SetNull`:
  - `UserInvite.createdById`
  - `MemberMessageLog.sentByUserId`
- Criada e aplicada migration incremental: `20260420162027_spec_013_add_missing_on_delete`.

### Simplificacao da exclusao de visitante

- Refatorado `delete-visitante.service.ts` para orquestrar o fluxo com `prisma.$transaction`.
- Removida a logica de delecao manual redundante de entidades cobertas por cascade no banco.
- Mantida apenas a regra de negocio nao coberta por FK: exclusao de familiares que ficam orfaos.

### Repositories novos para regra de orfao

- Criado `find-related-member-ids.repository.ts` para coletar familiares do principal antes do delete.
- Criado `is-orphan-member.repository.ts` para validar orfandade por regra de dominio:
  - sem `MemberVisitor`
  - sem `MemberRelationship` remanescente.

### Limpeza de legado

- Removido `delete-visitante.repository.ts`, que concentrava orquestracao de fluxo que passou para o service.
- Removido teste legado correspondente e substituido por testes focados na nova arquitetura.

### Documentacao da entrega

- Atualizada a SPEC 013 com status `Concluido`, checklist marcado e secao de pos-mortem com aprendizados da implementacao.

## Testes

- Testes de service atualizados para validar:
  - exclusao do principal
  - exclusao de familiar orfao
  - preservacao de familiar nao orfao
  - ausencia de transacao quando visitante nao existe.
- Testes novos de repository adicionados para:
  - `find-related-member-ids.repository.ts`
  - `is-orphan-member.repository.ts`
- Execucoes validadas durante a entrega:
  - `npx vitest run`
  - `npm run lint`
  - `npx prisma migrate status`
