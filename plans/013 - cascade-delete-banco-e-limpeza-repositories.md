# SPEC 013 - Cascade Delete no Banco e Limpeza de Repositories

## 1. Contexto

O schema Prisma já possui `onDelete: Cascade` em várias relações. Porém, os repositories de exclusão de visitante e usuário realizam deleções manuais de entidades filhas que o banco já gerencia automaticamente, gerando código redundante e risco de divergência.

Esta SPEC mapeia o estado atual dos cascades, identifica relações que ainda carecem de configuração e remove lógica manual desnecessária nos repositories.

---

## 2. Objetivo de Negocio

Garantir que a responsabilidade de exclusão em cascata fique no banco de dados (contrato explícito no schema Prisma), simplificando os repositories e reduzindo o risco de inconsistência de dados quando a lógica manual é esquecida ou alterada de forma incorreta.

Adicionalmente, garantir que membros de família cadastrados exclusivamente como vínculos de um visitante sejam excluídos junto com o visitante principal quando se tornarem órfãos — sem outros vínculos ou registro de visitante próprio.

---

## 3. Escopo

### 3.1 Em escopo

- Mapear todos os `onDelete` existentes no schema Prisma
- Identificar relações sem `onDelete` que deveriam ter `Cascade` ou `SetNull`
- Adicionar `onDelete` ausentes via migration
- Remover chamadas manuais de exclusão em repositories onde o banco já garante o cascade
- Identificar e conservar lógica manual que não é coberta por cascade (ex: órfãos sem vínculo direto de FK)
- Implementar exclusão de membros de família órfãos ao excluir visitante principal

### 3.2 Fora de escopo

- Alteração de regras de negócio de exclusão
- Soft-delete (lógica existente de `deletedAt` permanece inalterada)
- Exclusão de outros módulos além de `visitantes` e `usuarios`

---

## 4. Requisitos Funcionais

- **RF-01**: Todas as entidades filhas de `Member` devem ter `onDelete: Cascade` configurado no schema Prisma
- **RF-02**: Entidades relacionadas a `User` com FK direta devem ter `onDelete` explícito (Cascade ou SetNull conforme regra de negócio)
- **RF-03**: O service de exclusão de visitante deve delegar a remoção de entidades cobertas por cascade ao banco, sem chamadas manuais redundantes
- **RF-04**: Repositories que realizavam deleções manuais de entidades agora gerenciadas pelo banco devem ser removidos ou simplificados
- **RF-05**: Repositories que ainda são necessários (entidades órfãs sem cascade) devem ser mantidos e documentados com comentário da razão
- **RF-06**: Ao excluir um visitante, todos os `Member` de família que se tornarem órfãos devem ser excluídos em cascata pelo service
  - Um `Member` é considerado **órfão** após a exclusão do principal se:
    1. Não possui `MemberVisitor` próprio (não é um visitante direto), **E**
    2. Não possui nenhum outro `MemberRelationship` ativo com outros membros
- **RF-07**: A exclusão de membros órfãos ocorre dentro de uma transação com a exclusão do membro principal — ou ambos são removidos, ou nenhum

---

## 5. Requisitos Nao Funcionais

- Nenhuma perda de dados ou alteração de comportamento funcional
- Migration deve ser incremental (sem reset)
- `npx prisma generate` executado após toda alteração de schema
- Testes existentes de exclusão devem continuar passando

---

## 6. Modelagem de Dados

### Estado atual dos cascades no schema

| Modelo filho | FK para | onDelete atual | Ação |
|---|---|---|---|
| `UserPermission` | `userId → User` | `Cascade` ✅ | Manter |
| `MemberVisitor` | `memberId → Member` | `Cascade` ✅ | Manter |
| `MemberPray` | `memberId → Member` | `Cascade` ✅ | Manter |
| `MemberPray` | `prayId → (sem model Pray visível)` | `Cascade` ✅ | Manter |
| `MemberRelationship` | `principalMemberId → Member` | `Cascade` ✅ | Manter |
| `MemberRelationship` | `relatedMemberId → Member` | `Cascade` ✅ | Manter |
| `MemberMessageLog` | `memberId → Member` | `Cascade` ✅ | Manter |
| `MemberMessageLog` | `messageTemplateId → MessageTemplate` | `SetNull` ✅ | Manter |
| `MemberMessageLog` | `sentByUserId → User` | **Ausente** ⚠️ | Adicionar `SetNull` |
| `UserInvite` | `createdById → User` | **Ausente** ⚠️ | Adicionar `SetNull` |
| `UserInvite` | `usedById → User` | **Ausente** ⚠️ | Adicionar `SetNull` |

### Alterações de schema necessárias

```prisma
// MemberMessageLog.sentByUserId
sentByUser   User?  @relation(fields: [sentByUserId], references: [id], onDelete: SetNull)

// UserInvite.createdById
createdBy    User   @relation("InvitesCreated", fields: [createdById], references: [id], onDelete: SetNull)

// UserInvite.usedById
usedBy       User?  @relation("InviteUsed", fields: [usedById], references: [id], onDelete: SetNull)
```

> **Decisão**: `SetNull` para `sentByUserId` e campos de invite porque o User é soft-deleted (`deletedAt`). Hard delete de User não ocorre no fluxo atual, mas a constraint deve existir como contrato de segurança.

---

## 7. Fluxos Funcionais

### Fluxo atual de exclusão de visitante (com lógica manual)

```
DELETE /api/visitantes/:id
  → deleteVisitanteService(id)
    → deleteMemberPraysRepository(memberId)       ← redundante (Cascade)
    → deleteMemberVisitorRepository(memberId)     ← redundante (Cascade)
    → deleteMemberRelationshipsRepository(...)    ← redundante (Cascade)
    → deleteMemberMessageLogsRepository(memberId) ← redundante (Cascade)
    → deleteMemberRepository(memberId)            ← permanece
```

### Fluxo após simplificação

```
DELETE /api/visitantes/:id
  → deleteVisitanteService(id)
    → findRelatedMemberIdsRepository(memberId)        ← coleta IDs dos familiares ANTES de deletar
    → transaction:
        → deleteMemberRepository(memberId)            ← banco garante cascade de MemberRelationship, MemberVisitor, etc.
        → para cada relatedMemberId:
            → isOrphanMemberRepository(relatedMemberId) ← sem MemberVisitor E sem outros vínculos
            → se órfão: deleteMemberRepository(relatedMemberId)
```

> **Por que coletar ANTES?** Após deletar o principal, os `MemberRelationship` são removidos por cascade — não é mais possível saber quem eram os familiares.

### Definição de órfão

Um `Member` relacionado é órfão se, após a remoção do principal:
- **Não tem** registro em `MemberVisitor` (não é visitante direto)
- **Não tem** nenhum `MemberRelationship` restante com qualquer outro membro

Se tiver `MemberVisitor` ou outro vínculo → **não é orphão** → manter no banco.

---

## 8. Contratos de Camadas (Arquitetura)

### Service: `delete-visitante.service.ts`

**Antes:**
```ts
async function deleteVisitanteService(id: string) {
  await deleteMemberPraysRepository(id)
  await deleteMemberVisitorRepository(id)
  await deleteMemberRelationshipsRepository(id)
  await deleteMemberMessageLogsRepository(id)
  await deleteMemberRepository(id)
}
```

**Depois:**
```ts
async function deleteVisitanteService(id: string) {
  // Coletar familiares ANTES de deletar (cascade remove os vínculos junto)
  const relatedMemberIds = await findRelatedMemberIdsRepository(id)

  await prisma.$transaction(async (tx) => {
    // Banco garante cascade de MemberRelationship, MemberVisitor, MemberPray, MemberMessageLog
    await deleteMemberRepository(id, tx)

    // Excluir familiares que se tornaram órfãos
    for (const relatedId of relatedMemberIds) {
      const isOrphan = await isOrphanMemberRepository(relatedId, tx)
      if (isOrphan) {
        await deleteMemberRepository(relatedId, tx)
      }
    }
  })
}
```

### Repositories novos necessários

- `find-related-member-ids.repository.ts` — retorna array de IDs de Members relacionados ao membro informado (via `MemberRelationship`)
- `is-orphan-member.repository.ts` — retorna `boolean`: sem `MemberVisitor` E sem `MemberRelationship` restante

### Repositories a remover (se existirem como funções isoladas de delete por memberId)

- `delete-member-prays.repository.ts` — se existir apenas para cascade de membro
- `delete-member-visitor.repository.ts` — se existir apenas para cascade de membro
- `delete-member-relationships.repository.ts` — se existir apenas para cascade de membro
- `delete-member-message-logs.repository.ts` — se existir apenas para cascade de membro

> **Regra**: antes de remover qualquer repository, verificar todos os callers. Se o repository tiver outro uso legítimo (ex: desvinculação sem exclusão do membro), manter com escopo claro.

> **Atenção sobre transação**: `deleteMemberRepository` e `isOrphanMemberRepository` devem aceitar `db: RepositoryClient = prisma` para funcionar tanto standalone quanto dentro de `tx`. Verificar callers existentes antes de modificar — conforme diretriz do AGENTS.md sobre composição em transação.

---

## 9. Endpoints

Nao se aplica nesta SPEC — não há novos endpoints. O comportamento externo permanece idêntico.

---

## 10. Estrutura de Arquivos (proposta)

### Arquivos a modificar

```
prisma/schema.prisma                                         ← adicionar onDelete ausentes
prisma/migrations/<timestamp>_add_missing_on_delete/         ← nova migration

src/modules/visitantes/services/delete-visitante.service.ts  ← adicionar lógica de órfão + transação
```

### Arquivos a criar

```
src/modules/visitantes/repositories/find-related-member-ids.repository.ts
src/modules/visitantes/repositories/is-orphan-member.repository.ts
```

### Arquivos a remover (condicional — verificar callers antes)

```
src/modules/visitantes/repositories/delete-member-prays.repository.ts
src/modules/visitantes/repositories/delete-member-visitor.repository.ts
src/modules/visitantes/repositories/delete-member-relationships.repository.ts
src/modules/visitantes/repositories/delete-member-message-logs.repository.ts
```

---

## 11. Regras de Validacao

- Nao se aplica nesta SPEC — sem inputs de usuário novos.

---

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado que um `Member` é excluído, então `MemberVisitor`, `MemberPray`, `MemberRelationship` e `MemberMessageLog` associados devem ser removidos automaticamente pelo banco, sem chamadas manuais no service.
- **CA-02** (RF-02): Dado que o schema é atualizado, então `MemberMessageLog.sentByUserId`, `UserInvite.createdById` e `UserInvite.usedById` possuem `onDelete: SetNull` definido.
- **CA-03** (RF-03): O service `delete-visitante.service.ts` não chama repositories das entidades cobertas por cascade (prays, visitor, relationships, logs).
- **CA-04** (RF-04): Repositories removidos não aparecem em nenhum import no projeto.
- **CA-05** (RF-05): Repositories mantidos possuem comentário explicando por que o cascade não os cobre.
- **CA-06** (RF-06): Dado visitante com familiar que **não possui** `MemberVisitor` próprio e **não possui** outros vínculos, quando o visitante é excluído, então o familiar também é excluído.
- **CA-07** (RF-06): Dado visitante com familiar que **possui** `MemberVisitor` próprio (é visitante direto), quando o visitante principal é excluído, então o familiar **não é excluído**.
- **CA-08** (RF-06): Dado visitante com familiar que possui vínculo com um **terceiro** membro além do principal, quando o principal é excluído, então o familiar **não é excluído**.
- **CA-09** (RF-07): Se a exclusão do familiar órfão falhar, a exclusão do principal também é revertida (atomicidade via transação).
- **CA-10**: `npx vitest run` passa sem falhas após as alterações.
- **CA-11**: `prisma migrate status` não apresenta drift após a entrega.

---

## 13. Riscos e Decisoes em Aberto

| Item | Descrição | Decisão |
|---|---|---|
| User é soft-deleted | Hard delete de User não é o fluxo atual; `onDelete: SetNull` nos campos de invite e log é precaução. | Adicionar SetNull como contrato de segurança |
| Repositories com múltiplos callers | Antes de remover, checar todos os imports. | Verificar antes de remover |
| `onDelete: SetNull` exige campo nullable | `createdById` em `UserInvite` pode não ser nullable. | Avaliar no schema antes da migration |
| Familiar com vínculo com o próprio principal + terceiro | Se B é familiar de A e de C, e A é excluído → B ainda tem vínculo com C → não é órfão → manter. | Verificação `isOrphan` deve considerar vínculos remanescentes com **qualquer** outro membro |
| `deleteMemberRepository` aceita `tx` | Verificar se o repository existente aceita `RepositoryClient` para funcionar dentro de transação sem quebrar callers standalone. | Criar novo repository de delete dentro de tx se necessário, conforme padrão AGENTS.md |
| Órfão com `MemberPray`, `MemberMessageLog` próprios | Ao excluir um Members órfão, o banco remove seus registros filhos por cascade automaticamente. | Sem ação adicional necessária |

---

## 14. Plano de Implementacao (ordem)

1. Ler `prisma/schema.prisma` e confirmar estado atual de cada `onDelete`
2. Ler `delete-visitante.service.ts` e todos os repositories de delete de member
3. Verificar callers de cada repository de delete (garantir que nenhum tem outro uso antes de remover)
4. Verificar se `deleteMemberRepository` aceita `RepositoryClient` externo — se não, criar variante para transação
5. Atualizar `prisma/schema.prisma` com os `onDelete` ausentes (garantindo nullabilidade onde necessário)
6. Criar migration: `npx prisma migrate dev --name add-missing-on-delete`
7. Executar `npx prisma generate`
8. Criar `find-related-member-ids.repository.ts`
9. Criar `is-orphan-member.repository.ts`
10. Atualizar `delete-visitante.service.ts` — adicionar coleta de familiares + transação + lógica de órfão
11. Remover repositories redundantes (após confirmar zero callers)
12. Atualizar/remover testes dos repositories removidos
13. Adicionar testes para os novos repositories e nova lógica do service
14. Rodar `npx vitest run`
15. Rodar lint

---

## 15. Estrategia de Testes

### Repositories novos
- `find-related-member-ids.repository.test.ts`: retorna IDs corretos para member com e sem familiares
- `is-orphan-member.repository.test.ts`:
  - Membro sem `MemberVisitor` e sem vínculos restantes → `true`
  - Membro com `MemberVisitor` → `false`
  - Membro com outros vínculos → `false`

### Service (`delete-visitante.service.ts`)
- Mock `findRelatedMemberIdsRepository` retornando 1 familiar
- Mock `isOrphanMemberRepository` → `true`: verifica que `deleteMemberRepository` é chamado 2x (principal + órfão)
- Mock `isOrphanMemberRepository` → `false`: verifica que `deleteMemberRepository` é chamado 1x (só principal)
- Mock `findRelatedMemberIdsRepository` retornando array vazio: verifica que `isOrphanMemberRepository` não é chamado

### Repositories removidos
- Deletar arquivos de teste correspondentes se existirem

### Migration
- Validar com `prisma migrate status` sem drift

---

## 16. Pos-mortem da Entrega (Aprendizados)

### O que funcionou bem

- Mover a orquestracao de exclusao para o service deixou o fluxo mais aderente ao padrao controller/service/repository e mais simples de manter.
- Delegar cascades ao banco reduziu codigo redundante e removeu risco de esquecer delecoes manuais ao evoluir o dominio.
- Implementar `findRelatedMemberIdsRepository` antes do delete do principal foi essencial para preservar contexto dos familiares.

### Riscos evitados e ajustes importantes

- `onDelete: SetNull` exigiu tornar FKs nullable (`createdById`, `sentByUserId`), evitando inconsistencias entre contrato Prisma e banco.
- A verificacao de callers antes de remover repository evitou quebrar fluxos de atualizacao de visitante que reutilizam repositories de delete pontual.
- A regra de orfao (sem `MemberVisitor` e sem `MemberRelationship`) precisa permanecer em repository dedicado, pois nao e coberta apenas por FK.

### Recomendacoes para proximas SPECs

- Sempre modelar explicitamente no texto da SPEC o que e responsabilidade do banco (`onDelete`) e o que e regra de negocio manual.
- Em mudancas de schema relacional, validar cedo nullabilidade + migration antes de refatorar services para reduzir retrabalho.
- Em exclusoes com efeitos em grafo de relacionamentos, priorizar testes de service para provar atomicidade transacional e cenarios de nao exclusao.

---

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `GitHub Copilot`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [x] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado (nao aplicavel: sem alteracoes necessarias)
- [x] UI criada/atualizada (quando aplicavel) (nao aplicavel)
- [x] Migration criada (quando aplicavel)
- [x] `npx prisma generate` executado (quando aplicavel)
- [x] Testes adicionados/atualizados
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados
