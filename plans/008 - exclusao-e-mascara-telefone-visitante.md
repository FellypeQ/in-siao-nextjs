# SPEC 008 - Exclusão de Visitante e Máscara de Telefone

## 1. Contexto

Dois ajustes independentes mas relacionados ao módulo de visitantes: (1) o fluxo de exclusão precisa garantir que todos os dados relacionados ao visitante sejam removidos corretamente, sem deixar registros órfãos; (2) o campo de telefone carece de máscara visual e de um componente padronizado que separe formatação de exibição do valor bruto armazenado.

## 2. Objetivo de Negocio

Permitir exclusão segura e completa de visitantes, e padronizar o input e exibição de telefone em toda a aplicação com máscara `(xx) xxxxx-xxxx`.

## 3. Escopo

### 3.1 Em escopo

- Exclusão de visitante com remoção em cascata de todos os registros relacionados: `MemberVisitor`, `MemberPray`, `MemberRelationship` (como origem e destino), `Pray` órfão (sem outros vínculos após remoção)
- Componente `PhoneField` reutilizável com máscara `(xx) xxxxx-xxxx`
- `onChange` do `PhoneField` fornece apenas dígitos (sem formatação)
- Aplicar `PhoneField` no formulário de cadastro/edição de visitante
- Máscara de exibição do telefone em listagem e modal de detalhe do visitante

### 3.2 Fora de escopo

- Exclusão em lote de visitantes
- Alterações em outros módulos que usem telefone (usuários, etc.)
- Soft delete de visitante (exclusão é hard delete com limpeza de relacionamentos)

## 4. Requisitos Funcionais

- **RF-01**: Ao excluir um visitante, todos os registros relacionados devem ser removidos do banco: `MemberVisitor`, todos os `MemberPray` do membro, `MemberRelationship` onde o membro é origem (`memberId`) ou destino (`relatedMemberId`), e registros `Pray` que ficarem sem nenhum `MemberPray` vinculado após a remoção
- **RF-02**: O componente `PhoneField` exibe o valor formatado `(xx) xxxxx-xxxx` e entrega ao `onChange` apenas os dígitos
- **RF-03**: O formulário de cadastro/edição de visitante usa `PhoneField` no campo de telefone
- **RF-04**: A listagem de visitantes e o modal de detalhe exibem o telefone com a máscara `(xx) xxxxx-xxxx`
- **RF-05**: A exclusão é protegida por permissão `VISITANTES_EXCLUIR`

## 5. Requisitos Nao Funcionais

- **RNF-01**: O `PhoneField` não depende de biblioteca externa de máscara — implementar lógica de formatação pura com regex/replace
- **RNF-02**: A limpeza de relacionamentos na exclusão ocorre dentro de uma transação Prisma para garantir atomicidade
- **RNF-03**: Componente `PhoneField` reutilizável em `frontend/components/inputs/`

## 6. Modelagem de Dados (quando aplicavel)

Sem alteração de schema Prisma. A limpeza de relacionamentos é feita via queries Prisma em transação no service de exclusão.

Ordem de exclusão dentro da transação (sem constraints de FK violadas):
1. `MemberPray` onde `memberId = id`
2. `Pray` onde `id` não tem mais nenhum `MemberPray` (após passo 1)
3. `MemberRelationship` onde `memberId = id` OR `relatedMemberId = id`
4. `MemberVisitor` onde `memberId = id`
5. `Member` onde `id = id`

## 7. Fluxos Funcionais

### Fluxo 1 — Exclusão de visitante

1. Usuário clica em excluir na listagem
2. Frontend exibe diálogo de confirmação
3. Usuário confirma → `DELETE /api/visitantes/[id]`
4. Controller valida sessão + `VISITANTES_EXCLUIR`
5. `deleteVisitanteService(id)` executa limpeza em transação
6. Retorna 200 → frontend remove o item da listagem

### Fluxo 2 — Input de telefone (cadastro/edição)

1. Usuário digita no `PhoneField`
2. Valor exibido: `(11) 99999-9999`
3. `onChange` recebe: `11999999999` (somente dígitos)
4. Formulário armazena e envia somente dígitos para a API

### Fluxo 3 — Exibição de telefone (listagem/detalhe)

1. Telefone armazenado: `11999999999`
2. Utilitário `formatPhone(phone)` converte para `(11) 99999-9999`
3. Exibido na tabela e no modal de detalhe

## 8. Contratos de Camadas (Arquitetura)

### DELETE /api/visitantes/[id]
- **Controller** (`api/visitantes/[id]/route.ts`): valida sessão + `VISITANTES_EXCLUIR`, chama service, retorna 200
- **Service** (`delete-visitante.service.ts`): orquestra a transação de exclusão via repository
- **Repository** (`delete-visitante.repository.ts`): executa `prisma.$transaction` com as 5 etapas de limpeza

### PhoneField
- **Componente** (`frontend/components/inputs/phone-field.tsx`): `<TextField>` MUI com lógica de máscara interna
- **Utilitário** (`frontend/shared/utils/format-phone.ts`): função pura `formatPhone(digits: string): string`

## 9. Endpoints (quando aplicavel)

### DELETE /api/visitantes/[id]

**Guard**: sessão válida + `VISITANTES_EXCLUIR`

**Response 200**: `{ "success": true }`

**Response 401**: sem sessão

**Response 403**: sem `VISITANTES_EXCLUIR`

**Response 404**: visitante não encontrado

**Response 500**: falha na transação de exclusão

## 10. Estrutura de Arquivos (proposta)

```
src/
  app/
    api/
      visitantes/
        [id]/
          route.ts                              ← DELETE atualizado [MODIFICADO]

  frontend/
    components/
      inputs/
        phone-field.tsx                         ← [NOVO]
    shared/
      utils/
        format-phone.ts                         ← [NOVO]
    features/
      visitantes/
        components/
          visitante-form.tsx                    ← usa PhoneField [MODIFICADO]
          visitantes-list.tsx                   ← exibição com formatPhone [MODIFICADO]

  modules/
    visitantes/
      services/
        delete-visitante.service.ts             ← limpeza em cascata [MODIFICADO]
      repositories/
        delete-visitante.repository.ts          ← transação Prisma [MODIFICADO]

test/
  frontend/
    components/
      inputs/
        phone-field.test.tsx                    ← [NOVO]
  modules/
    visitantes/
      services/
        delete-visitante.service.test.ts        ← [NOVO/ATUALIZADO]
  app/
    api/
      visitantes/
        [id]/
          route.test.ts                         ← DELETE [ATUALIZADO]
```

## 11. Regras de Validacao

- O `PhoneField` aceita somente dígitos no `onChange` — caracteres não numéricos são descartados internamente
- Máscara aplicada progressivamente: até 2 dígitos → `(xx`; até 7 → `(xx) xxxxx`; até 11 → `(xx) xxxxx-xxxx`
- Telefone salvo no banco sempre como string de dígitos puros
- Exclusão requer `id` válido como param de rota; não existir retorna 404 antes da transação

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado visitante com `MemberVisitor`, `MemberPray`, `MemberRelationship` e `Pray` vinculados, quando excluído, então todos esses registros são removidos do banco sem erro
- **CA-02** (RF-01): Dado um `Pray` compartilhado com outro membro (além do excluído), quando o visitante é excluído, então o `Pray` NÃO é excluído (mantém o vínculo do outro membro)
- **CA-03** (RF-02): Dado `PhoneField` com valor `11999999999`, então exibe `(11) 99999-9999` e `onChange` entrega `11999999999`
- **CA-04** (RF-03): Dado formulário de visitante, quando usuário digita o telefone, então vê a máscara aplicada progressivamente
- **CA-05** (RF-04): Dado visitante com telefone `11999999999`, quando exibido na listagem ou detalhe, então aparece como `(11) 99999-9999`
- **CA-06** (RF-05): Dado usuário sem `VISITANTES_EXCLUIR`, quando envia `DELETE /api/visitantes/[id]`, então recebe 403

## 13. Riscos e Decisoes em Aberto

- **Decisão**: Exclusão hard delete com cascata manual via transação — não soft delete de visitante. Razão: a solicitação é explícita em remover todos os relacionamentos.
- **Decisão**: `Pray` compartilhado com outro membro é preservado — apenas o `MemberPray` do membro excluído é removido.
- **Decisão**: `PhoneField` sem biblioteca externa de máscara — mantém dependências mínimas.
- **Risco**: O service de exclusão atual (`delete-visitante.service.ts`) pode já existir com lógica parcial — verificar antes de criar do zero e atualizar se necessário.
- **Risco**: Registros de `MemberMessageLog` (introduzidos na SPEC 009) relacionados ao visitante excluído — a SPEC 009 deve definir o comportamento de exclusão desses logs; a SPEC 008 não cobre registros ainda não existentes, mas o service de delete deve ser extensível.

## 14. Plano de Implementacao (ordem)

1. Verificar implementação atual de `delete-visitante.service.ts` e `delete-visitante.repository.ts`
2. Atualizar repository com transação de limpeza em cascata (5 etapas)
3. Atualizar service para usar o repository atualizado
4. Criar `format-phone.ts` utilitário
5. Criar `phone-field.tsx` componente
6. Atualizar `visitante-form.tsx` para usar `PhoneField`
7. Atualizar `visitantes-list.tsx` para usar `formatPhone` na exibição
8. Escrever testes
9. `npx vitest run` — sem falhas
10. Lint sem erro

## 15. Estrategia de Testes

- **Service** `delete-visitante`: happy path (todos os registros removidos), Pray compartilhado preservado, visitante inexistente retorna erro
- **Controller** `DELETE /api/visitantes/[id]`: 200 sucesso, 401 sem sessão, 403 sem permissão, 404 não encontrado
- **Componente** `PhoneField`: exibe máscara corretamente com dígitos progressivos, `onChange` entrega somente dígitos, campo vazio não quebra
- **Utilitário** `formatPhone`: formata corretamente, retorna vazio para string vazia, funciona com 10 e 11 dígitos

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `Claude Sonnet 4.6`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [x] Schema criado/atualizado — sem alteração de schema (cascatas via Prisma já existentes)
- [x] Repository criado/atualizado — `delete-visitante.repository.ts` criado com transação e limpeza de Pray órfão
- [x] Service criado/atualizado — `delete-visitante.service.ts` atualizado para usar novo repository
- [x] Controller/route criado/atualizado — `DELETE /api/visitantes/[id]` já estava correto com guard `VISITANTES_EXCLUIR`
- [x] UI criada/atualizada — `PhoneField`, `format-phone.ts`, `visitante-form.tsx`, `visitantes-list.tsx`
- [x] Migration criada — não aplicável (sem mudança de schema)
- [x] `npx prisma generate` executado — não aplicável (sem mudança de schema)
- [x] Testes adicionados/atualizados — 4 novos arquivos de teste (service, route DELETE, PhoneField, formatPhone)
- [x] Testes passando — 111 testes, 37 arquivos, 0 falhas
- [x] Lint sem erro — `eslint` exit 0
- [x] Criterios de aceite validados — CA-01 a CA-06 cobertos

---

## Pos-Mortem (SPEC 008)

### O que foi bem

- **Cascatas do schema já resolviam 80% do problema**: `MemberVisitor`, `MemberPray` e `MemberRelationship` já tinham `onDelete: Cascade` configurado no schema Prisma. A exclusão do `Member` já limpava esses registros automaticamente. O único gap real era o `Pray` órfão.
- **Separação de repository limpa**: a decisão de criar `delete-visitante.repository.ts` separado (em vez de modificar `delete-member.repository.ts`) foi correta — preservou o uso do repositório original na `update-visitante.service.ts`, que o chama com um `tx` externo para excluir familiares desvinculados.
- **Controller já estava correto**: a rota `DELETE /api/visitantes/[id]` já existia com guard de permissão `VISITANTES_EXCLUIR`. Zero retrabalho de controller.
- **PhoneField sem dependência externa**: implementação pura com regex/replace, alinhada ao RNF-01.
- **formatPhone com suporte a 10 e 11 dígitos**: a SPEC mencionava ambos os formatos; a função diferencia celular (11 dígitos: `(xx) xxxxx-xxxx`) de fixo (10 dígitos: `(xx) xxxx-xxxx`).

### O que foi diferente do planejado

- **`delete-member.repository.ts` tem dois callers**: a SPEC assumia que o único caller era o service de exclusão de visitante. Na prática, `update-visitante.service.ts` também usa o mesmo repository para excluir membros familiares desvinculados, passando um `tx` externo. Isso impediu modificar o repository existente — foi necessário criar um novo `delete-visitante.repository.ts` com a transação interna.
- **A SPEC nomeava o repository como `delete-visitante.repository.ts`** mas o código existente usava `delete-member.repository.ts`. O novo arquivo foi criado com o nome da SPEC, mantendo o antigo intacto.

### Aprendizados para SPECs futuras

- Antes de propor alteração em um repository, verificar todos os callers — o pattern `(db: RepositoryClient = prisma)` sinaliza que o repository é composto externamente em transações.
- A presença de `onDelete: Cascade` no schema Prisma deve ser mapeada explicitamente na SPEC para evitar implementar manualmente o que o banco já garante.
- Ao especificar o plano de exclusão em cascata, listar também quais entidades JÁ são cobertas por cascade do banco, separando do que precisa de lógica manual.
