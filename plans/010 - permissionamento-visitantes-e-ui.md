# SPEC 010 - Permissionamento de Visitantes e Melhoria de UI de Permissões

## 1. Contexto

Com as SPECs 007, 008 e 009 entregues, o sistema possui novas telas, ações e permissões. Esta SPEC consolida o permissionamento de todas as novas funcionalidades do módulo de visitantes e corrige o layout da tela de gerenciamento de permissões de usuários, que atualmente exibe todas as permissões de forma vertical sem agrupamento visual.

## 2. Objetivo de Negocio

Garantir que todas as ações introduzidas nas SPECs anteriores tenham guards de permissão aplicados corretamente em UI e backend, e melhorar a usabilidade da tela de administração de permissões com layout agrupado e responsivo.

## 3. Escopo

### 3.1 Em escopo

- Auditoria de guards de permissão em todas as rotas e componentes introduzidos nas SPECs 007, 008 e 009
- Correção de qualquer guard faltante identificado na auditoria
- Melhoria do layout da tela de permissões: display flex com flex-wrap por categoria, categorias mantidas em stack vertical
- Verificação de que `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR` aparecem corretamente na tela de gerenciamento de permissões de usuários

### 3.2 Fora de escopo

- Criação de novas permissões além das já introduzidas em SPECs anteriores
- Refatoração do sistema de permissões (modelo de dados, fluxo de autenticação)
- Permissões para módulos fora do escopo de visitantes e mensagens
- Novos papéis (roles) de usuário

## 4. Requisitos Funcionais

- **RF-01**: Todas as rotas API introduzidas nas SPECs 007-009 devem ter guard de sessão e permissão corretos (auditoria e correção)
- **RF-02**: Todos os elementos de UI condicionais (cards, botões, seções) introduzidos nas SPECs 007-009 devem respeitar as permissões do usuário logado
- **RF-03**: A tela de gerenciamento de permissões de um usuário (`/admin/usuarios/[id]/permissoes` ou equivalente) deve exibir as permissões de cada categoria em layout flex horizontal com wrap, com espaçamento entre itens
- **RF-04**: As categorias de permissões continuam empilhadas verticalmente — somente os itens dentro de cada categoria ficam lado a lado com wrap
- **RF-05**: `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR` aparecem na tela de permissões sob a categoria "Mensagens"

## 5. Requisitos Nao Funcionais

- **RNF-01**: Auditoria deve cobrir ao menos: todos os `route.ts` novos das SPECs 007-009 e todos os componentes com lógica condicional baseada em permissão
- **RNF-02**: Layout de permissões usa exclusivamente MUI (`Box`, `Checkbox`, `FormControlLabel`) com `sx` — sem CSS externo
- **RNF-03**: Nenhuma regressão nos testes existentes das rotas já testadas

## 6. Modelagem de Dados (quando aplicavel)

Não se aplica nesta SPEC. As permissões são constantes TypeScript armazenadas como strings no banco — sem migração necessária.

## 7. Fluxos Funcionais

### Fluxo 1 — Auditoria de guards

1. Listar todas as rotas API e páginas introduzidas nas SPECs 007-009
2. Para cada rota: verificar se `requireAuthSessionForApi()` + `hasPermission()` está presente
3. Para cada componente com ação: verificar se a renderização condicional usa `permissions.includes(...)` ou hook equivalente
4. Registrar gaps e corrigir no mesmo PR

### Fluxo 2 — Layout de permissões

1. Usuário acessa gerenciamento de permissões de um usuário
2. Vê cada categoria de permissões em bloco vertical
3. Dentro de cada categoria, as checkboxes ficam em linha com wrap (ex: 3 por linha em telas médias)
4. Em telas menores, cada checkbox ocupa linha própria

## 8. Contratos de Camadas (Arquitetura)

Esta SPEC é predominantemente de UI e auditoria. Sem novos services ou repositories. Eventuais correções de guard são ajustes pontuais nos `route.ts` existentes.

## 9. Endpoints (quando aplicavel)

Não se aplica — sem novos endpoints. Correções são em endpoints já existentes.

## 10. Estrutura de Arquivos (proposta)

```
src/
  frontend/
    features/
      usuarios/
        components/
          user-permissions-form.tsx            ← layout flex com wrap [MODIFICADO]

test/
  frontend/
    features/
      usuarios/
        components/
          user-permissions-form.test.tsx       ← atualizar/adicionar testes de layout [ATUALIZADO]
  app/
    api/
      visitantes/
        chart/
          route.test.ts                        ← verificar cobertura de guards [VERIFICAR]
      mensagens/
        route.test.ts                          ← verificar cobertura [VERIFICAR]
```

## 11. Regras de Validacao

### Checklist de auditoria de guards por SPEC

**SPEC 007 (home + chart)**:
- [ ] `GET /api/visitantes/chart` → guard `VISITANTES_LISTAR`
- [ ] Card "Cadastrar" → oculto sem `VISITANTES_CADASTRAR`
- [ ] Card "Listar" → oculto sem `VISITANTES_LISTAR`
- [ ] Gráfico → oculto sem `VISITANTES_LISTAR`
- [ ] `/visitantes/listagem/page.tsx` → guard `VISITANTES_LISTAR`

**SPEC 008 (delete + telefone)**:
- [ ] `DELETE /api/visitantes/[id]` → guard `VISITANTES_EXCLUIR`
- [ ] Botão de excluir na UI → oculto sem `VISITANTES_EXCLUIR`

**SPEC 009 (mensagens)**:
- [ ] `GET /api/mensagens` → guard `MENSAGENS_GERENCIAR`
- [ ] `POST /api/mensagens` → guard `MENSAGENS_GERENCIAR`
- [ ] `PUT /api/mensagens/[id]` → guard `MENSAGENS_GERENCIAR`
- [ ] `DELETE /api/mensagens/[id]` → guard `MENSAGENS_GERENCIAR`
- [ ] `GET /api/visitantes/[id]/mensagens` → guard `MENSAGENS_ENVIAR` ou `MENSAGENS_GERENCIAR`
- [ ] `POST /api/visitantes/[id]/mensagens` → guard `MENSAGENS_ENVIAR`
- [ ] `/mensagens/page.tsx` → guard `MENSAGENS_GERENCIAR`
- [ ] Card "Mensagens" na home → oculto sem `MENSAGENS_GERENCIAR` e sem `MENSAGENS_ENVIAR`
- [ ] Botão "Enviar próxima mensagem" → oculto sem `MENSAGENS_ENVIAR`

### Regras de layout

- Categoria: `<Box sx={{ mb: 2 }}>` com título da categoria
- Itens: `<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>` contendo os `<FormControlLabel>` de cada permissão

## 12. Criterios de Aceite

- **CA-01** (RF-01): Dado chamada a qualquer rota API das SPECs 007-009 sem sessão, então retorna 401
- **CA-02** (RF-01): Dado chamada com sessão mas sem a permissão específica exigida, então retorna 403
- **CA-03** (RF-02): Dado usuário sem `VISITANTES_CADASTRAR`, quando acessa home de visitantes, então card "Cadastrar" não aparece
- **CA-04** (RF-03, RF-04): Dado admin acessa gerenciamento de permissões de usuário, então vê checkboxes de cada categoria agrupados horizontalmente com wrap, e categorias empilhadas verticalmente
- **CA-05** (RF-05): Dado admin acessa gerenciamento de permissões, então vê categoria "Mensagens" com `MENSAGENS_GERENCIAR` e `MENSAGENS_ENVIAR`
- **CA-06** (RF-01): Todos os testes existentes de rotas continuam passando sem regressão

## 13. Riscos e Decisoes em Aberto

- **Risco**: Gaps na auditoria podem revelar rotas sem guard nas SPECs 007-009 — o time de desenvolvimento deve corrigir no mesmo PR desta SPEC
- **Decisão**: Layout de permissões usa gap MUI (`gap: 1` = 8px) entre checkboxes dentro da categoria — pode ser ajustado visualmente na implementação
- **Risco**: Testes de `user-permissions-form.tsx` podem precisar de atualização se a estrutura JSX mudar com o novo layout

## 14. Plano de Implementacao (ordem)

1. Executar checklist de auditoria de guards (seção 11) nos arquivos das SPECs 007-009
2. Corrigir quaisquer guards faltantes encontrados
3. Atualizar testes de rotas afetadas por correções de guard
4. Atualizar `user-permissions-form.tsx` com novo layout flex/wrap
5. Atualizar testes de `user-permissions-form.tsx`
6. `npx vitest run` — sem falhas
7. Lint sem erro

## 15. Estrategia de Testes

- **Auditoria de rotas**: verificar nos testes existentes se há casos de 403 para cada permissão das rotas das SPECs 007-009; adicionar casos faltantes
- **UI** `user-permissions-form`: renderiza categorias em stack vertical, renderiza checkboxes dentro de cada categoria em layout flex, exibe categoria "Mensagens" com as duas novas permissões

## Status de Execucao

- Estado: `Backlog`
- Responsavel: `<definir>`
- Ultima atualizacao: `2026-04-20`

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
