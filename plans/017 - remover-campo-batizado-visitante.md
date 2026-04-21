# SPEC 018 - Remover Campo "Batizado" do Visitante

## 1. Contexto

O modelo `Member` possui o campo `baptized` (booleano). Este campo está exposto no formulário de cadastro/edição de visitante e na exportação Excel. Decidiu-se remover este campo da experiência do usuário — tanto da interface quanto da exportação — por não ser mais relevante ao fluxo atual.

---

## 2. Objetivo de Negocio

Simplificar o formulário de cadastro e a exportação de visitantes, removendo informações que não são utilizadas nas decisões operacionais da equipe.

---

## 3. Escopo

### 3.1 Em escopo

- Remover campo `baptized` do formulário de criação de visitante (`visitante-form.tsx`)
- Definir `baptized` com valor padrão interno `false` no fluxo de criação (`create-visitante.schema.ts` e/ou service)
- Definir `baptized` com valor padrão interno `false` no fluxo de atualização (`update-visitante.schema.ts` e/ou service)
- Remover coluna "Batizado" da exportação Excel (service de exportação e schema)
- Atualizar testes afetados por essa remoção
- **Não remover** o campo `baptized` do banco de dados (preservar dados existentes; remoção de coluna é migration irreversível sem justificativa)

### 3.2 Fora de escopo

- Remoção da coluna `baptized` do schema Prisma e do banco de dados
- Alteração de qualquer outra tela ou funcionalidade
- Impacto em relatórios além da exportação Excel

---

## 4. Requisitos Funcionais

- **RF-01**: O campo "Batizado" não aparece no formulário de cadastro/edição de visitante
- **RF-02**: No fluxo de criação, `baptized` deve assumir `false` por padrão sem entrada do usuário
- **RF-03**: No fluxo de atualização, `baptized` deve assumir `false` por padrão sem entrada do usuário
- **RF-04**: A exportação Excel não inclui a coluna "Batizado"
- **RF-05**: O banco de dados e o schema Prisma **não são alterados** — `baptized` permanece no modelo como campo interno

---

## 5. Requisitos Nao Funcionais

- Dados existentes de visitantes batizados não são afetados
- Sem migration de banco
- `npx vitest run` deve passar sem falhas após as alterações

---

## 6. Modelagem de Dados

Nao se aplica nesta SPEC — sem alterações de schema Prisma ou banco.

O campo `baptized: Boolean` permanece em `Member` no banco mas deixa de ser exposto pela aplicação.
Quando não informado pela interface, o valor aplicado pelo backend deve ser `false`.

---

## 7. Fluxos Funcionais

Sem alterações de fluxo na UI. A criação e edição de visitante continuam funcionando sem o campo `baptized` para preenchimento. A aplicação deve garantir `baptized = false` internamente ao persistir.

---

## 8. Contratos de Camadas (Arquitetura)

### Schema `create-visitante.schema.ts`

- Não expor `baptized` para preenchimento na UI
- Garantir default interno `false` (via schema/service)

### Schema `update-visitante.schema.ts`

- Não expor `baptized` para preenchimento na UI
- Garantir default interno `false` (via schema/service)

### Services de criação/atualização de visitante

- Garantir persistência com `baptized: false` quando o campo não vier de input da interface

### Service `export-excel-visitantes.service.ts` (ou repository equivalente)

- Remover o mapeamento de `baptized` para a coluna "Batizado" na planilha
- Atualizar índices de coluna nos testes conforme AGENTS_TESTS.md aprendizado 12

### Componente `visitante-form.tsx`

- Remover o campo/input de "Batizado" (checkbox ou select)
- Remover qualquer state ou prop relacionada

---

## 9. Endpoints

Nao se aplica nesta SPEC — sem novos endpoints.

---

## 10. Estrutura de Arquivos (proposta)

### Arquivos a modificar

```
src/modules/visitantes/schemas/create-visitante.schema.ts
src/modules/visitantes/schemas/update-visitante.schema.ts
src/modules/visitantes/services/export-excel-visitantes.service.ts   ← confirmar nome real
src/frontend/features/visitantes/components/visitante-form.tsx

test/modules/visitantes/schemas/create-visitante.schema.test.ts       ← se existir
test/modules/visitantes/schemas/update-visitante.schema.test.ts       ← se existir
test/modules/visitantes/services/export-excel-visitantes.service.test.ts ← atualizar índices
```

---

## 11. Regras de Validacao

O campo `baptized` não deve ser exibido para preenchimento no formulário. No backend, o valor efetivo deve ser `false` por padrão nos fluxos de criação e atualização.

---

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado o formulário de cadastro de visitante, então o campo "Batizado" não está presente no DOM.
- **CA-02** (RF-02, RF-03): Dado body de criação/atualização sem o campo `baptized`, então o fluxo persiste com `baptized = false`.
- **CA-03** (RF-02, RF-03): Dado body com `baptized` enviado indevidamente, o valor efetivo persistido continua `false` no fluxo padrão da aplicação.
- **CA-04** (RF-04): Dado exportação Excel gerada, então nenhuma coluna com o nome "Batizado" está presente na planilha.
- **CA-05** (RF-05): O schema Prisma não é alterado; `npx prisma migrate status` não apresenta drift.
- **CA-06**: `npx vitest run` passa sem falhas — testes com índices de coluna da exportação foram atualizados.

---

## 13. Riscos e Decisoes em Aberto

| Item                            | Descrição                                                          | Decisão                                                                  |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `baptized` no banco             | Campo permanece no banco com dados históricos — intencional        | Não criar migration de remoção                                           |
| Valor default no backend        | Mesmo sem campo na UI, o backend deve persistir `baptized = false` | Garantir default na camada de schema/service para não depender do client |
| Índices de coluna na exportação | Remover coluna pode quebrar asserts por índice nos testes          | Atualizar todos os asserts de índice no mesmo commit                     |
| `baptized` em testes            | Mudança de contrato pode quebrar asserts antigos                   | Atualizar testes para validar default `false` em vez de input manual     |

---

## 14. Plano de Implementacao (ordem)

1. Revisar `create-visitante.schema.ts` para garantir default interno `false`
2. Revisar `update-visitante.schema.ts` para garantir default interno `false`
3. Ler `visitante-form.tsx` e remover o campo/input de batizado
4. Ler service/repository de exportação e remover coluna "Batizado"
5. Garantir na camada de service/repository que o valor persistido de `baptized` seja `false`
6. Atualizar testes de schema/serviço para validar default `false`
7. Atualizar testes de exportação (atualizar índices de coluna)
8. Rodar `npx vitest run`
9. Rodar lint

---

## 15. Estrategia de Testes

- Atualizar testes de schema para validar que o default interno de `baptized` é `false`
- Atualizar testes de exportação Excel: ajustar todos os índices de coluna afetados pela remoção
- Adicionar caso de teste: criação/atualização sem `baptized` → persistência com `baptized = false`
- Verificar testes de formulário: garantir que o campo "Batizado" não está sendo buscado por `getByLabelText` ou similar

---

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `GitHub Copilot`
- Ultima atualizacao: `2026-04-21`

### Checklist de Entrega

- [x] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado
- [x] UI criada/atualizada (quando aplicavel)
- [ ] Migration criada (quando aplicavel)
- [ ] `npx prisma generate` executado (quando aplicavel)
- [x] Testes adicionados/atualizados
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados
