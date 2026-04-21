# SPEC 020 - Corrigir Exportação de Visitantes

## 1. Contexto

A exportação Excel de visitantes possui dois problemas identificados:

1. A coluna de data de cadastro está rotulada como "Criado em" — deve ser renomeada para "Data de cadastro" para melhor clareza ao usuário final
2. A coluna "Tipo de Membro" está presente na exportação mas não agrega valor ao contexto atual de uso

Esta SPEC corrige ambos os pontos na camada de geração do Excel.

---

## 2. Objetivo de Negocio

Melhorar a qualidade da exportação Excel para uso operacional da equipe, com nomenclatura clara e sem colunas desnecessárias que poluem a planilha.

---

## 3. Escopo

### 3.1 Em escopo

- Renomear header da coluna "Criado em" para "Data de cadastro" no Excel gerado
- Remover a coluna "Tipo de Membro" da exportação
- Atualizar testes de exportação (índices de coluna)

### 3.2 Fora de escopo

- Alterações no banco de dados
- Alterações em outras telas além da exportação
- Alterações no formato de data (apenas o rótulo muda)
- Outras abas da exportação além da afetada

---

## 4. Requisitos Funcionais

- **RF-01**: A coluna anteriormente chamada "Criado em" é renomeada para "Data de cadastro" na planilha exportada
- **RF-02**: A coluna "Tipo de Membro" é removida da planilha exportada
- **RF-03**: As demais colunas e seus dados permanecem inalterados
- **RF-04**: A ordem das colunas remanescentes é preservada (exceto pela remoção de "Tipo de Membro")

---

## 5. Requisitos Nao Funcionais

- Sem alterações de banco ou schema Prisma
- Sem alterações de comportamento funcional além da estrutura da planilha
- `npx vitest run` deve passar após atualização dos testes

---

## 6. Modelagem de Dados

Nao se aplica nesta SPEC.

---

## 7. Fluxos Funcionais

Sem alterações de fluxo. O endpoint de exportação, o service e o trigger de download permanecem iguais.

---

## 8. Contratos de Camadas (Arquitetura)

### Service/Repository de exportação

Localizar onde os headers de coluna são definidos no service de exportação Excel (provavelmente em `export-excel-visitantes.service.ts` ou repository equivalente).

**Alterar:**

- `"Criado em"` → `"Data de cadastro"`

**Remover:**

- Coluna `"Tipo de Membro"` e o mapeamento de `member.type` correspondente

---

## 9. Endpoints

Nao se aplica nesta SPEC — endpoint de exportação permanece inalterado.

---

## 10. Estrutura de Arquivos (proposta)

### Arquivos a modificar

```
src/modules/visitantes/services/export-excel-visitantes.service.ts   ← confirmar nome real do arquivo

test/modules/visitantes/services/export-excel-visitantes.service.test.ts  ← atualizar índices
```

---

## 11. Regras de Validacao

Nao se aplica nesta SPEC.

---

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado exportação gerada, então a coluna de data de cadastro possui o header "Data de cadastro".
- **CA-02** (RF-02): Dado exportação gerada, então nenhuma coluna com header "Tipo de Membro" está presente na planilha.
- **CA-03** (RF-03): Dado exportação gerada, então os dados das demais colunas (nome, telefone, email, etc.) estão corretos e sem alteração.
- **CA-04** (RF-04): A ordem das colunas remanescentes está preservada.
- **CA-05**: `npx vitest run` passa sem falhas — asserts por índice nos testes de exportação foram atualizados.

---

## 13. Riscos e Decisoes em Aberto

| Item                         | Descrição                                                                                          | Decisão                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Índices de coluna em testes  | Remover "Tipo de Membro" desloca índices subsequentes — asserts por índice quebram silenciosamente | Atualizar todos os asserts de índice no mesmo commit conforme aprendizado 12 do Orchestrator |
| Múltiplas abas na exportação | Verificar se "Tipo de Membro" e "Criado em" aparecem em mais de uma aba                            | Aplicar correção em todas as abas afetadas                                                   |
| Header exato                 | Confirmar grafias exatas no código ("Criado em" vs "criado_em" vs outro)                           | Verificar no código antes de alterar                                                         |

---

## 14. Plano de Implementacao (ordem)

1. Ler o service/repository de exportação Excel para localizar os headers de coluna
2. Identificar todas as ocorrências de "Criado em" e "Tipo de Membro" (e variações como `type`, `memberType`)
3. Renomear "Criado em" → "Data de cadastro"
4. Remover coluna "Tipo de Membro" e o mapeamento de dados correspondente
5. Ler os testes de exportação existentes
6. Atualizar todos os asserts por índice de coluna afetados pela remoção
7. Rodar `npx vitest run`
8. Rodar lint

---

## 15. Estrategia de Testes

- Atualizar testes de exportação existentes:
  - Verificar que coluna "Data de cadastro" existe com o header correto
  - Verificar que coluna "Tipo de Membro" **não** existe
  - Reindexar todos os asserts por índice que foram deslocados pela remoção
- Adicionar caso de teste explícito verificando ausência de "Tipo de Membro"
- Adicionar caso de teste verificando presença de "Data de cadastro"

---

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `GitHub Copilot`
- Ultima atualizacao: `2026-04-21`

### Checklist de Entrega

- [ ] Schema criado/atualizado
- [x] Repository criado/atualizado
- [x] Service criado/atualizado
- [x] Controller/route criado/atualizado
- [ ] UI criada/atualizada (quando aplicavel)
- [ ] Migration criada (quando aplicavel)
- [ ] `npx prisma generate` executado (quando aplicavel)
- [x] Testes adicionados/atualizados
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados
