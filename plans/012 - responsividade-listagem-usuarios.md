# SPEC 012 - Responsividade da Listagem de Usuários

## 1. Contexto

A tela de listagem de usuários (`/admin/usuarios`) não está responsiva em telas menores: o conteúdo transborda horizontalmente sem possibilidade de scroll, tornando a navegação inacessível em dispositivos móveis ou janelas estreitas.

## 2. Objetivo de Negocio

Garantir que a listagem de usuários seja utilizável em qualquer tamanho de tela, com scroll horizontal quando o conteúdo não couber na viewport.

## 3. Escopo

### 3.1 Em escopo

- Adicionar scroll horizontal (`overflow-x: auto`) no container da tabela de usuários
- Garantir que a tabela não quebre o layout em telas menores que 768px (mobile/tablet)

### 3.2 Fora de escopo

- Redesenho completo da listagem de usuários
- Layout responsivo com colunas ocultas em mobile (pode ser feito em spec futura)
- Responsividade de outras telas (visitantes, mensagens, etc.)
- Paginação ou virtualização da tabela

## 4. Requisitos Funcionais

- **RF-01**: Em telas menores que a largura da tabela, a tabela de usuários deve apresentar scroll horizontal sem quebrar o layout da página
- **RF-02**: Em telas largas (desktop), o comportamento atual deve ser mantido

## 5. Requisitos Nao Funcionais

- **RNF-01**: Solução via `sx` do MUI no componente existente — sem CSS externo
- **RNF-02**: Usar `TableContainer` com `sx={{ overflowX: "auto" }}` ou `Box` equivalente como wrapper
- **RNF-03**: Alteração mínima e cirúrgica — sem refatoração do componente

## 6. Modelagem de Dados (quando aplicavel)

Não se aplica nesta SPEC.

## 7. Fluxos Funcionais

### Fluxo 1 — Usuário em tela pequena acessa listagem de usuários

1. Usuário acessa `/admin/usuarios` em dispositivo mobile ou janela estreita
2. Tabela excede a largura da viewport
3. Container exibe scroll horizontal, permitindo visualizar todas as colunas
4. Conteúdo fora da tabela (header, sidebar, ações) não é afetado

## 8. Contratos de Camadas (Arquitetura)

Não se aplica — alteração exclusiva de UI, sem backend.

## 9. Endpoints (quando aplicavel)

Não se aplica nesta SPEC.

## 10. Estrutura de Arquivos (proposta)

```
src/
  frontend/
    features/
      usuarios/
        components/
          usuarios-table.tsx               ← adicionar TableContainer com overflow-x [MODIFICADO]

test/
  frontend/
    features/
      usuarios/
        components/
          usuarios-table.test.tsx          ← verificar cobertura existente [VERIFICAR]
```

## 11. Regras de Validacao

Não se aplica — sem lógica de negócio ou validação de entrada.

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado tela com largura menor que a tabela, quando usuário acessa listagem de usuários, então scroll horizontal está disponível e funcional
- **CA-02** (RF-02): Dado tela desktop, quando usuário acessa listagem de usuários, então a tabela ocupa o espaço disponível normalmente sem scroll desnecessário

## 13. Riscos e Decisoes em Aberto

- **Decisão**: Scroll horizontal como solução imediata — ocultar colunas em mobile é uma evolução possível para spec futura se o scroll não atender ao UX desejado
- **Risco**: Se o componente de tabela usa `DataGrid` do MUI X, o comportamento de scroll pode diferir de `Table` simples — verificar o componente atual antes de implementar

## 14. Plano de Implementacao (ordem)

1. Identificar o componente que renderiza a tabela de usuários (`usuarios-table.tsx` ou equivalente)
2. Verificar se usa MUI `Table` ou MUI X `DataGrid`
3. Envolver a tabela em `TableContainer` com `sx={{ overflowX: "auto" }}` (para `Table`) ou configurar `sx={{ width: "100%", overflowX: "auto" }}` no container do `DataGrid`
4. Testar visualmente em viewport estreito
5. `npx vitest run` — sem falhas
6. Lint sem erro

## 15. Estrategia de Testes

- **UI** `usuarios-table`: não há novo comportamento lógico a testar — verificar se testes existentes continuam passando após a mudança de estrutura JSX (wrapper adicional)

## Status de Execucao

- Estado: `Concluido`
- Responsavel: `GitHub Copilot`
- Ultima atualizacao: `2026-04-20`

### Checklist de Entrega

- [x] Schema criado/atualizado (nao se aplica)
- [x] Repository criado/atualizado (nao se aplica)
- [x] Service criado/atualizado (nao se aplica)
- [x] Controller/route criado/atualizado (nao se aplica)
- [x] UI criada/atualizada (quando aplicavel)
- [x] Migration criada (quando aplicavel) (nao se aplica)
- [x] `npx prisma generate` executado (quando aplicavel) (nao se aplica)
- [x] Testes adicionados/atualizados (nao se aplica: testes existentes validados)
- [x] Testes passando
- [x] Lint sem erro
- [x] Criterios de aceite validados
