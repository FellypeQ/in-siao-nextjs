# Agent de App — In-Sião

## Responsabilidade

Definir o que pode e o que não pode entrar em cada subpasta de `src/app/`. Esta camada é exclusivamente de **entrada da aplicação**: roteamento, configuração global e controllers HTTP. Nenhuma lógica de negócio, acesso a banco ou componente de UI complexo vive aqui.

---

## Mapa da Pasta `src/app/`

```
src/app/
  (web_pages)/        → rotas de página (Server Components finos)
  api/                → rotas de API (controllers HTTP finos)
  layout.tsx          → root layout global
  providers.tsx       → ThemeProvider, CssBaseline, Suspense
  emotion-registry.tsx → SSR registry para Emotion/MUI
  globals.css         → reset e variáveis CSS globais
  favicon.ico         → favicon da aplicação
  page.module.css     → módulo CSS do root (se necessário)
```

---

## Subpasta `(web_pages)/` — Páginas

### O que é

Route group do Next.js App Router. Cada `page.tsx` aqui representa uma rota acessível pelo browser.

### Regra absoluta

`page.tsx` deve ser um **Server Component fino**. Ele apenas:

1. Chama `requireAuthSession()` ou `requireAdminSession()` para proteger a rota
2. Extrai dados mínimos da sessão necessários para o View
3. Renderiza um único componente de View importado de `src/frontend/features/`

```ts
// CORRETO
export default async function VisitantesPage() {
  const session = await requireAuthSession()

  return (
    <AuthenticatedShell user={{ nome: session.nome, role: session.role, permissions: session.permissions }}>
      <VisitantesListView />
    </AuthenticatedShell>
  )
}
```

### O que NUNCA entra em `(web_pages)/`

- Lógica de negócio
- Acesso direto ao Prisma
- Chamadas de service
- Componentes MUI ou JSX complexo inline
- Gerenciamento de estado (`useState`, `useEffect`)
- Qualquer coisa que não seja: autenticar + renderizar View

### Estrutura de pastas dentro de `(web_pages)/`

Espelha as rotas da aplicação:

```
(web_pages)/
  page.tsx                        → /
  login/page.tsx                  → /login
  cadastro/page.tsx               → /cadastro
  visitantes/
    page.tsx                      → /visitantes
    novo/page.tsx                 → /visitantes/novo
    [id]/editar/page.tsx          → /visitantes/:id/editar
  admin/
    usuarios/
      page.tsx                    → /admin/usuarios
      [id]/page.tsx               → /admin/usuarios/:id
      [id]/editar/page.tsx        → /admin/usuarios/:id/editar
```

---

## Subpasta `api/` — Controllers HTTP

### O que é

Cada `route.ts` é um controller HTTP. Thin por definição.

### Regra absoluta

Um `route.ts` deve:

1. Extrair e validar o input da requisição com Zod
2. Verificar autenticação/permissão via `requireAuthSessionForApi()`
3. Chamar **exatamente um** service
4. Retornar `Response.json(...)` com status adequado

```ts
// CORRETO
export async function POST(req: Request) {
  const session = await requireAuthSessionForApi()
  const body = await req.json()
  const parsed = createVisitanteSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  const result = await createVisitanteService(parsed.data, session.sub)
  return Response.json(result, { status: 201 })
}
```

### O que NUNCA entra em `api/`

- Acesso direto ao Prisma
- Regra de negócio (if/else de domínio)
- Chamadas a múltiplos services (orquestração → vai no service)
- Transformação de dados além do parsing de input
- Lógica de autorização além de verificar sessão e permissão

### Estrutura de pastas dentro de `api/`

Espelha os recursos da API:

```
api/
  auth/
    sign-in/route.ts
    sign-out/route.ts
    sign-up/route.ts
    convite/
      validate/route.ts
  visitantes/
    route.ts                → GET (list) + POST (create)
    [id]/route.ts           → GET + PUT + DELETE
    export/route.ts
  usuarios/
    route.ts
    convites/route.ts
    [id]/
      route.ts
      permissoes/route.ts
```

---

## Arquivos Core de `src/app/` (raiz)

| Arquivo | Responsabilidade | Pode modificar? |
|---|---|---|
| `layout.tsx` | Root layout, providers, fontes | Sim — para adicionar providers globais |
| `providers.tsx` | `ThemeProvider`, `CssBaseline`, `GlobalLoadingBar` | Sim — imports do tema vêm de `src/lib/theme.ts` |
| `emotion-registry.tsx` | Registro SSR do Emotion para MUI | Raramente — apenas para configuração do MUI |
| `globals.css` | Reset CSS global e variáveis | Sim — com cuidado para não quebrar MUI |
| `favicon.ico` | Ícone da aplicação | Sim |

### Regra sobre `providers.tsx`

O tema MUI deve ser **importado** de `src/lib/theme.ts`, nunca definido inline em `providers.tsx`. `providers.tsx` é apenas o ponto de montagem dos providers.

---

## O que NUNCA vai em `src/app/`

- Componentes de UI reutilizáveis → vão em `src/frontend/components/`
- Lógica de feature → vai em `src/frontend/features/`
- Services, repositories, schemas → vão em `src/modules/`
- Utilitários compartilhados → vão em `src/shared/`
- Configuração de tema → vai em `src/lib/theme.ts`

---

## Testes Correspondentes

Testes de `src/app/` ficam em `test/app/`, espelhando a estrutura:

```
test/app/
  (web_pages)/login/page.test.tsx
  api/visitantes/route.test.ts
  api/visitantes/[id]/route.test.ts
```

Para testes de route (`api/`), ver `AGENTS_TESTS.md` — seção Route (Controller).
