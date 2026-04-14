# Orquestrador de Planos e SPECs (Padrao Oficial)

Este documento define o padrao obrigatorio para criar, evoluir e executar qualquer SPEC/PLAN no projeto.

Objetivos:

- padronizar qualidade tecnica e clareza de escopo
- reduzir retrabalho e ambiguidade
- acelerar handoff entre agentes e humanos
- garantir aderencia a arquitetura do projeto

---

## 1. Quando usar

Use este orquestrador sempre que:

- criar nova SPEC/PLAN
- revisar SPEC/PLAN existente
- atualizar escopo durante execucao
- quebrar uma feature em fases/entregas

---

## 2. Convencao de arquivos

Local: `plans/`

Formato de nome:

`NNN - <tema-...-...>.md`

Regras:

- usar numeracao incremental de 3 digitos (`000`, `001`, `002`...)
- nao duplicar assunto em dois arquivos diferentes
- manter um unico arquivo por SPEC ativa
- evitar versoes paralelas com nomes parecidos

---

## 3. Estrutura obrigatoria da SPEC

Toda SPEC deve conter os blocos abaixo, nesta ordem:

1. Contexto
2. Objetivo de negocio
3. Escopo
4. Requisitos funcionais (RF)
5. Requisitos nao funcionais (RNF)
6. Modelagem de dados (quando aplicavel)
7. Fluxos funcionais
8. Contratos de camadas (Controller/Service/Repository)
9. Endpoints (quando aplicavel)
10. Estrutura de arquivos proposta
11. Regras de validacao
12. Criterios de aceite (CA)
13. Riscos e decisoes em aberto
14. Plano de implementacao (ordem)
15. Estrategia de testes (obrigatoria para entregas com codigo)

Se algum bloco nao for aplicavel, manter o titulo e marcar como `Nao se aplica nesta SPEC` com justificativa curta.

---

## 4. Regras de escrita para eficiencia

### 4.1 Escopo claro

- separar explicitamente `Em escopo` e `Fora de escopo`
- evitar termos vagos como "melhorar", "otimizar" sem metrica

### 4.2 Requisitos rastreaveis

- cada requisito funcional deve ter ID (`RF-01`, `RF-02`...)
- cada criterio de aceite deve mapear para pelo menos um RF

### 4.3 Criterios testaveis

- criterios no formato `Dado / Quando / Entao`
- evitar criterio que dependa de interpretacao subjetiva

### 4.4 Decisoes tecnicas explicitas

- registrar escolhas que afetam arquitetura, seguranca ou dados
- registrar trade-offs quando houver mais de uma alternativa valida

### 4.5 Sem duplicacao estrutural

- nao repetir secoes inteiras entre SPECs
- reutilizar padrao, mas adaptar conteudo ao contexto da feature

---

## 5. Gate arquitetural obrigatorio

Toda SPEC deve respeitar:

- fluxo `Request -> Controller -> Service -> Repository -> Database`
- controller fino (sem regra de negocio)
- acesso a banco somente via repository
- validacao de input com Zod
- TypeScript sem `any`
- uso de MUI para UI

Se houver mudanca de banco:

- atualizar `prisma/schema.prisma`
- criar migration
- executar obrigatoriamente `npx prisma generate`

---

## 6. Politica de testes por camada

Toda SPEC que gera/edita codigo deve declarar testes minimos:

- schema: teste unitario de validacao
- service: fluxo feliz + regras de negocio + falhas esperadas
- repository: teste de integracao (ou justificativa tecnica para mock)
- endpoint: contrato HTTP (status, payload e erros)
- UI: renderizacao e comportamento critico

Entrega nao e considerada pronta sem cobertura coerente com o que foi alterado.

---

## 7. Ciclo operacional do orquestrador

### Etapa A - Descoberta

1. Ler AGENTS.md e SPECs anteriores relacionadas
2. Identificar dependencias tecnicas e funcionais
3. Confirmar premissas e restricoes

### Etapa B - Definicao da SPEC

1. Preencher estrutura obrigatoria completa
2. Validar consistencia entre RF, CA e plano de implementacao
3. Registrar riscos e decisoes em aberto

### Etapa C - Execucao

1. Implementar por fatias pequenas (schema -> repository -> service -> controller -> UI)
2. Atualizar status da SPEC conforme progresso
3. Rodar testes e lint no fim de cada fatia relevante

### Etapa D - Fechamento

1. Revisar checklist de saida
2. Marcar decisoes finais
3. Registrar pendencias para proxima SPEC (se houver)

---

## 8. Template padrao de status dentro da SPEC

Adicionar no final de toda SPEC:

```md
## Status de Execucao

- Estado: `Backlog | Em andamento | Bloqueado | Concluido`
- Responsavel: `<nome do agent/pessoa>`
- Ultima atualizacao: `AAAA-MM-DD`

### Checklist de Entrega

- [ ] Schema criado/atualizado
- [ ] Repository criado/atualizado
- [ ] Service criado/atualizado
- [ ] Controller/route criado/atualizado
- [ ] UI criada/atualizada (quando aplicavel)
- [ ] Migration criada (quando aplicavel)
- [ ] `npx prisma generate` executado (quando aplicavel)
- [ ] Testes adicionados/atualizados
- [ ] Testes passando
- [ ] Lint sem erro
- [ ] Criterios de aceite validados
```

---

## 9. Template base para nova SPEC

Copiar e preencher:

```md
# SPEC NNN - <Titulo>

## 1. Contexto

## 2. Objetivo de Negocio

## 3. Escopo

### 3.1 Em escopo

### 3.2 Fora de escopo

## 4. Requisitos Funcionais

## 5. Requisitos Nao Funcionais

## 6. Modelagem de Dados (quando aplicavel)

## 7. Fluxos Funcionais

## 8. Contratos de Camadas (Arquitetura)

## 9. Endpoints (quando aplicavel)

## 10. Estrutura de Arquivos (proposta)

## 11. Regras de Validacao

## 12. Criterios de Aceite

## 13. Riscos e Decisoes em Aberto

## 14. Plano de Implementacao (ordem)

## 15. Estrategia de Testes

## Status de Execucao

- Estado: `Backlog`
- Responsavel: `<definir>`
- Ultima atualizacao: `<AAAA-MM-DD>`

### Checklist de Entrega

- [ ] Schema criado/atualizado
- [ ] Repository criado/atualizado
- [ ] Service criado/atualizado
- [ ] Controller/route criado/atualizado
- [ ] UI criada/atualizada (quando aplicavel)
- [ ] Migration criada (quando aplicavel)
- [ ] `npx prisma generate` executado (quando aplicavel)
- [ ] Testes adicionados/atualizados
- [ ] Testes passando
- [ ] Lint sem erro
- [ ] Criterios de aceite validados
```

---

## 10. Checklist de revisao rapida da SPEC

Antes de iniciar implementacao, validar:

- o problema de negocio esta claro?
- o que esta fora de escopo esta explicito?
- todos os RF possuem CA testavel?
- ha impacto de banco? se sim, migration + prisma generate foram previstos?
- a estrutura proposta respeita modules/services/repositories?
- existe estrategia de testes compativel com a entrega?

Se qualquer resposta for `nao`, ajustar a SPEC antes de codar.

---

## 11. Politica de mudanca de escopo

Mudancas durante execucao devem:

1. atualizar secao `Escopo`
2. atualizar `Requisitos` impactados
3. atualizar `Criterios de Aceite`
4. registrar em `Riscos e Decisoes em Aberto`
5. atualizar `Status de Execucao` com data

Sem essa atualizacao, a mudanca nao e considerada oficial.
