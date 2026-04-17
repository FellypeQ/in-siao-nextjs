# Agent de Frontend — In-Sião

## Responsabilidade

Definir arquitetura, responsabilidades e padrões de qualidade de tudo dentro de `src/frontend/`. Esta camada é exclusivamente de **interface com o usuário**: componentes React, views de feature e utilitários de UI. Nenhuma regra de negócio, acesso a banco ou chamada direta ao Prisma vive aqui.

---

## Mapa da Pasta `src/frontend/`

```
src/frontend/
  components/       → componentes React reutilizáveis e genéricos
  features/         → componentes específicos de domínio/feature
  shared/           → hooks, utils e constantes compartilhados entre features
```

---

## `components/` — Componentes Compartilhados

### O que é

Componentes React **sem domínio de negócio**. São reutilizáveis em qualquer feature, não têm conhecimento de visitantes, usuários ou qualquer entidade específica do sistema.

### Organização interna por tipo

```
components/
  feedback/         → estados de UI: loading, erros, alertas, toasts
  inputs/           → campos de formulário customizados
  layout/           → estrutura de página: shell, header, sidebar, drawer
```

### Exemplos corretos

```
components/feedback/global-loading-bar.tsx
components/inputs/password-field.tsx
components/layout/authenticated-shell.tsx
```

### Regras

- Recebem dados via props — nunca fazem fetch diretamente
- Não importam de `features/` (dependência unidirecional: features → components)
- Exportam uma única função principal por arquivo
- Props devem ser tipadas com TypeScript (sem `any`)
- Usar `sx` do MUI em vez de `style` inline sempre que o componente for MUI

### Quando criar um componente aqui vs em `features/`

Se o componente pode ser usado por duas features diferentes → `components/`

Se o componente só faz sentido dentro de uma feature → `features/<dominio>/components/`

---

## `features/` — Componentes de Feature (Domínio)

### O que é

Views e componentes que implementam a UI de uma funcionalidade específica do sistema. Conhecem entidades de negócio (visitantes, usuários, autenticação).

### Organização interna

```
features/
  <dominio>/
    components/     → componentes e views da feature
    constants/      → enums, traduções, listas estáticas de domínio
    hooks/          → hooks específicos da feature (quando necessário)
```

### Estrutura atual

```
features/
  auth/
    components/
      login-page-view.tsx
      register-via-invite-page-view.tsx
      password-rules-checklist.tsx
  home/
    components/
      home-page-view.tsx
  visitantes/
    components/
      visitantes-list.tsx
      visitante-form.tsx
      export-visitantes-button.tsx
    constants/
      visitante-enum-translations.ts
  usuarios/
    components/
      usuarios-table.tsx
      usuario-detail.tsx
      usuario-form.tsx
      generate-invite-dialog.tsx
      delete-usuario-dialog.tsx
      user-permissions-form.tsx
      permissions-placeholder.tsx
```

### Nomenclatura obrigatória

- Views de página: `<entidade>-<acao>-view.tsx` ou `<entidade>-page-view.tsx`
- Listas: `<entidade>s-list.tsx` ou `<entidade>s-table.tsx`
- Formulários: `<entidade>-form.tsx`
- Dialogs: `<acao>-<entidade>-dialog.tsx`
- Botões de ação: `<acao>-<entidade>-button.tsx`

### Regras

- Componentes de feature **não acessam** `src/modules/` diretamente
- Toda comunicação com o backend é via `fetch` para `src/app/api/`
- Sem acesso direto ao Prisma ou services de backend
- Podem importar de `components/` e `shared/`
- Não importam de outras features (features são ilhas independentes)

---

## `shared/` — Utilitários Compartilhados

### O que é

Código utilitário reutilizável por múltiplas features, sem pertencer a nenhuma feature específica.

### Organização interna

```
shared/
  hooks/            → hooks React genéricos de UI
  utils/            → funções puras de transformação/formatação
  constants/        → constantes globais de UI
```

### Exemplos corretos

```
shared/hooks/use-permissions.ts    → verifica permissões do usuário logado
shared/utils/format-date.ts        → formatação de data para exibição
shared/constants/route-paths.ts    → constantes de rotas
```

### Regras

- Funções puras sempre que possível
- Hooks seguem naming `use-<nome>.ts`
- Sem estado global (Redux, Zustand) — usar context do React quando necessário

---

## Padrões de Qualidade de Código

### Client vs Server Components

- Componentes de `frontend/` são **sempre Client Components** quando usam hooks, eventos ou estado
- Marcar com `"use client"` no topo do arquivo
- Server Components ficam exclusivamente em `src/app/(web_pages)/`

### MUI — sx vs style

```tsx
// CORRETO — usar sx para propriedades MUI
<Box sx={{ display: "flex", alignItems: "center", gap: 2 }} />

// EVITAR — style bypass o sistema de tema
<Box style={{ display: "flex" }} />
```

Exceção: `style` pode ser usado para propriedades dinâmicas calculadas em JS que não têm equivalente em `sx` (ex: posicionamento calculado por biblioteca externa).

### Props em Server Components

Nunca passar funções diretamente como props para componentes MUI em Server Components:

```tsx
// ERRADO — em Server Component
<Button component={Link} href="/visitantes">...</Button>

// CORRETO — envolver em <Link>
<Link href="/visitantes">
  <Button>...</Button>
</Link>

// CORRETO — mover para Client Component dedicado
```

### Responsividade

Sempre usar breakpoints do tema MUI:

```tsx
sx={{
  display: { xs: "none", md: "flex" },
  px: { xs: 2, md: 5 },
  width: { xs: "100%", md: "420px" }
}}
```

### Componentes com múltiplos estados

Usar estado local (`useState`) dentro do componente. Não vazar estado entre componentes sem necessidade.

### Formulários

- Usar `react-hook-form` + `zod` para formulários com muitos campos
- Para formulários simples (2-3 campos), estado local com `useState` é aceitável

---

## Fronteiras Arquiteturais

```
src/app/(web_pages)/page.tsx
  ↓ importa View de
src/frontend/features/<dominio>/components/<view>.tsx
  ↓ pode importar de
src/frontend/components/<tipo>/<componente>.tsx
src/frontend/shared/hooks/<hook>.ts

src/frontend/**
  ↗ faz fetch para
src/app/api/<recurso>/route.ts
  ↓ chama
src/modules/<modulo>/services/<service>.ts
```

**Proibido atravessar fronteiras:**
- `frontend/` → `modules/` (direto, sem passar pela API)
- `frontend/` → `lib/prisma.ts`
- `features/<A>/` → `features/<B>/` (features não importam entre si)

---

## Testes Correspondentes

Testes de `src/frontend/` ficam em `test/frontend/`, espelhando a estrutura:

```
test/frontend/
  components/inputs/password-field.test.tsx
  components/layout/authenticated-shell.test.tsx
  features/auth/components/login-page-view.test.tsx
  features/visitantes/components/visitantes-list.test.tsx
```

Ver `AGENTS_TESTS.md` para padrões de teste de UI.
