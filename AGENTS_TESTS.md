# Agent de Testes — In-Sião

## Responsabilidade

Garantir que todo código testável tenha cobertura adequada, seguindo as convenções consolidadas do projeto. Este agent orienta criação, revisão e manutenção de testes em todas as camadas.

---

## Framework e Configuração

| Item | Valor |
|---|---|
| Framework | Vitest |
| Ambiente | jsdom |
| Setup global | `vitest.setup.ts` → importa `@testing-library/jest-dom/vitest` |
| Config | `vitest.config.ts` com alias `@/` → `src/` |
| Bibliotecas | `@testing-library/react`, `@testing-library/user-event` |
| Comando de execução | `npx vitest run` |
| Modo watch | `npx vitest` |

---

## Estrutura Obrigatória de Pastas

A pasta `test/` espelha exatamente a estrutura de `src/`, **sem** o prefixo `src/`.

```
test/
  app/
    (web_pages)/            → testes de Server Components (pages)
    api/
      <recurso>/
        route.test.ts       → testes de controllers HTTP
  frontend/
    components/
      <tipo>/               → testes de componentes compartilhados
    features/
      <dominio>/
        components/         → testes de componentes de feature
  modules/
    <modulo>/
      schemas/              → testes de validação Zod
      services/             → testes de serviços
      repositories/         → testes de repositórios (quando aplicável)
```

**Nunca criar arquivos `.test.tsx` dentro de `src/`.**

---

## Nomenclatura de Arquivos

Formato obrigatório: `<nome-do-arquivo-fonte>.test.ts` ou `<nome-do-arquivo-fonte>.test.tsx`

Exemplos:

```
src/frontend/components/inputs/password-field.tsx
→ test/frontend/components/inputs/password-field.test.tsx

src/app/api/visitantes/route.ts
→ test/app/api/visitantes/route.test.ts

src/modules/visitantes/services/create-visitante.service.ts
→ test/modules/visitantes/services/create-visitante.service.test.ts
```

---

## Padrão de Imports

Sempre usar o alias `@/` para referenciar código de `src/`. **Nunca usar caminho relativo** (`./` ou `../`).

```ts
// CORRETO
import { PasswordField } from "@/frontend/components/inputs/password-field"
import { GET, POST } from "@/app/api/visitantes/route"
import { createVisitanteService } from "@/modules/visitantes/services/create-visitante.service"

// ERRADO — quebra quando o arquivo de teste é movido para test/
import { PasswordField } from "./password-field"
```

---

## O Que Testar por Camada

### Schema (Zod)
- Valida dados corretos → sucesso
- Valida dados inválidos → retorna erros esperados
- Casos de borda de tipos, formatos e obrigatoriedade

### Service
- Fluxo feliz (happy path)
- Regras de negócio específicas
- Falhas esperadas (lançamento de `AppError`)
- Mock de repositórios via `vi.mock`

### Repository
- Testar quando houver lógica não trivial
- Preferir testes de integração com banco real quando viável
- Se mockar, documentar o motivo

### Route (Controller)
- Status HTTP correto por caso (200, 201, 400, 401, 403, 404, 500)
- Payload de resposta no formato esperado
- Autenticação/autorização: mock de sessão com `permissions` e `role` reais
- Mock de services via `vi.mock`

### Componente de UI
- Renderização inicial dos elementos críticos
- Comportamento de interação (clicks, inputs, submits)
- Estado de loading e erro
- Alertas condicionais (ex: parâmetros de URL)
- **Não testar CSS ou estilos**

---

## Padrões de Mock

### next/navigation
```ts
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}))
```

### fetch global
```ts
beforeEach(() => {
  global.fetch = vi.fn()
})

vi.mocked(global.fetch).mockResolvedValue({
  ok: true,
  json: async () => ({ success: true })
} as Response)
```

### Sessão de usuário (API routes)
```ts
vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: ["VISITANTES_CADASTRAR"],
    nome: "Usuario Teste",
    email: "usuario@teste.com"
  })
}))
```

### window.location.search
```ts
Object.defineProperty(window, "location", {
  value: { search: "?status=invite-sign-up-success" },
  writable: true
})
```

---

## Padrões de Queries (Testing Library)

Preferir queries por acessibilidade:

```ts
// Por papel e nome
screen.getByRole("button", { name: /entrar/i })
screen.getByRole("alert")
screen.getByRole("progressbar")

// Por placeholder
screen.getByPlaceholderText(/igrejasiao/i)

// Por texto
screen.getByText(/acesso ao sistema/i)
```

### Quando há múltiplos elementos do mesmo tipo

```ts
// ERRADO: falha com "found multiple elements"
screen.getByRole("button")

// CORRETO: especificar por nome
screen.getByRole("button", { name: /entrar/i })

// CORRETO: localizar via descendente
const progressbar = screen.getByRole("progressbar")
expect(progressbar.closest("button")).toBeDisabled()
```

---

## Nomenclatura dos Testes (describe / it)

- Escrever em **português**
- Formato do `it`: verbo no presente indicativo descrevendo o comportamento

```ts
describe("PasswordField", () => {
  it("inicia com senha oculta (type=password)")
  it("clique no toggle revela a senha")
  it("segundo clique volta a ocultar a senha")
})
```

---

## Regras Gerais

1. Usar `beforeEach(() => { vi.resetAllMocks() })` para limpar mocks entre testes
2. Usar `userEvent.setup()` em vez de `fireEvent` para interações realistas
3. Usar `await waitFor(...)` quando o resultado é assíncrono
4. Não testar o que o TypeScript já garante (redundante)
5. Não testar detalhes de implementação — testar comportamento observável
6. Um `describe` por arquivo de fonte
7. Testes devem ser independentes entre si (sem estado compartilhado mutável)

---

## Aprendizados Consolidados

1. **Imports relativos quebram ao mover testes**: sempre usar `@/` — o alias é configurado em `vitest.config.ts`.
2. **Múltiplos botões causam falha de query**: MUI renderiza botões dentro de componentes (ex: `PasswordField` gera um `IconButton`). Usar nome ou descendente para identificar.
3. **Botão em loading perde o texto acessível**: quando o conteúdo muda para `<CircularProgress>`, o nome acessível some. Localizar pelo progressbar e usar `.closest("button")`.
4. **Texto do botão é exato para queries**: `getByRole("button", { name: "Entrar" })` falha se o texto for `"ENTRAR →"`. Preferir regex `/entrar/i`.
5. **`window.location.search` em jsdom**: não usar `window.location.assign()` — redefinir via `Object.defineProperty` com `writable: true`.
6. **Mocks de sessão devem incluir `permissions`**: ao testar rotas protegidas por permissão, o mock de sessão deve conter o array `permissions` para não causar 403 inesperado.
7. **`npx prisma generate` antes de testes com Prisma**: qualquer mudança de schema sem regenerar o client causa erros de tipo silenciosos.

---

## Checklist de Entrega com Testes

- [ ] Arquivo de teste criado em `test/` espelhando a localização em `src/`
- [ ] Imports usando `@/`
- [ ] Cobertura mínima: schema, service, route e UI crítica
- [ ] Mocks refletem payload real (incluindo `permissions`)
- [ ] `npx vitest run` sem falhas
- [ ] Nenhum `console.error` silenciado sem motivo
