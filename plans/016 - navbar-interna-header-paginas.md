# SPEC 016 - Navbar Interna (Header) nas Páginas com Voltar e Título

## 1. Contexto

Atualmente as páginas internas do sistema (formulários de criação/edição, detalhes de visitante, perfil de usuário) não possuem um header/navbar padronizado com botão de voltar e título da página.

A navegação de retorno depende do botão "Voltar" do browser ou de botões espalhados de forma inconsistente pelos componentes. Isso compromete a UX, especialmente em mobile.

Esta SPEC define um novo padrão de layout para páginas pós-home: um header interno com botão de voltar e título da página.

---

## 2. Objetivo de Negocio

Criar uma experiência de navegação consistente e intuitiva nas páginas internas do sistema, permitindo ao usuário identificar claramente onde está e navegar de volta à página anterior sem depender do botão do browser.

---

## 3. Escopo

### 3.1 Em escopo

- Componente reutilizável `InnerPageHeader` com botão de voltar e título
- Aplicar em todas as páginas "filho" (não-home de cada seção):
  - `/visitantes/novo`
  - `/visitantes/:id/editar`
  - `/admin/usuarios/:id`
  - `/admin/usuarios/:id/editar`
  - `/perfil` (SPEC 015)
  - Qualquer página de "detalhe" ou "formulário" que exista
- Botão voltar usa `router.back()` como padrão
- Possibilidade de passar `href` explícito para o voltar (ex: quando a página pode ser acessada por deep link direto)

### 3.2 Fora de escopo

- Alterar o `AuthenticatedShell` (AppBar global com menu e logout)
- Páginas home de cada seção (`/`, `/visitantes`, `/admin/usuarios`, `/mensagens`) — sem inner header nelas
- Breadcrumbs completos
- Navegação em múltiplos níveis (mais de um nível de "voltar")

---

## 4. Requisitos Funcionais

- **RF-01**: O componente `InnerPageHeader` recebe `title: string` (obrigatório) e `backHref?: string` (opcional)
- **RF-02**: Exibe à esquerda um botão/ícone de seta para esquerda (ArrowBack do MUI) com texto "Voltar"
- **RF-03**: Exibe o título da página centralizado ou à direita do botão, com hierarquia tipográfica clara
- **RF-04**: Ao clicar em voltar sem `backHref`, chama `router.back()`
- **RF-05**: Ao clicar em voltar com `backHref`, navega para a rota especificada
- **RF-06**: O header é responsivo: em mobile ocupa largura total; em desktop respeita o container da página
- **RF-07**: As seguintes páginas adotam o novo componente: `/visitantes/novo`, `/visitantes/:id/editar`, `/admin/usuarios/:id`, `/admin/usuarios/:id/editar`, `/perfil`
- **RF-08**: O componente é posicionado no topo do conteúdo principal, abaixo do `AuthenticatedShell` AppBar global

---

## 5. Requisitos Nao Funcionais

- Componente `"use client"` pois usa `useRouter`
- Usar MUI exclusivamente para estilização
- Deve funcionar tanto dentro quanto fora do `AuthenticatedShell`
- Não introduzir dependência de estado global

---

## 6. Modelagem de Dados

Nao se aplica nesta SPEC — sem alterações de banco.

---

## 7. Fluxos Funcionais

### Fluxo de navegação com router.back()

```
Usuário clica "Voltar"
  → InnerPageHeader detecta: backHref não definido
  → router.back()
  → Navega para página anterior no histórico
```

### Fluxo de navegação com href explícito

```
Usuário clica "Voltar"
  → InnerPageHeader detecta: backHref = "/visitantes"
  → router.push("/visitantes")
  → Navega para rota específica
```

---

## 8. Contratos de Camadas (Arquitetura)

### Componente: `InnerPageHeader`

```tsx
interface InnerPageHeaderProps {
  title: string
  backHref?: string
}

export function InnerPageHeader({ title, backHref }: InnerPageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
      <IconButton onClick={handleBack} aria-label="Voltar">
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
    </Box>
  )
}
```

> **Nota**: O design visual exato (cores, espaçamento, tamanho de fonte) deve seguir o tema MUI existente. Sem hardcode de cores.

---

## 9. Endpoints

Nao se aplica nesta SPEC — sem novos endpoints.

---

## 10. Estrutura de Arquivos (proposta)

```
src/frontend/components/layout/
  inner-page-header.tsx           ← novo componente

src/frontend/features/visitantes/components/
  visitante-form.tsx              ← adicionar InnerPageHeader (ou na view)

src/frontend/features/usuarios/components/
  usuario-detail.tsx              ← adicionar InnerPageHeader
  usuario-form.tsx                ← adicionar InnerPageHeader

src/frontend/features/perfil/components/
  perfil-view.tsx                 ← adicionar InnerPageHeader (SPEC 015)
```

> **Alternativa de posicionamento**: se as views recebem o header via page.tsx (Server Component), o `InnerPageHeader` pode ser instanciado no `page.tsx` e passado como prop ou colocado acima da view. Decidir durante implementação qual abordagem minimiza boilerplate.

---

## 11. Regras de Validacao

Nao se aplica nesta SPEC — sem inputs de usuário.

---

## 12. Criterios de Aceite

- **CA-01** (RF-01, RF-02): O componente `InnerPageHeader` renderiza botão de voltar com ícone e texto "Voltar" e o título recebido via prop.
- **CA-02** (RF-04): Dado `backHref` não informado, quando clicar em "Voltar", então `router.back()` é chamado.
- **CA-03** (RF-05): Dado `backHref="/visitantes"`, quando clicar em "Voltar", então `router.push("/visitantes")` é chamado.
- **CA-04** (RF-07): As páginas `/visitantes/novo`, `/visitantes/:id/editar`, `/admin/usuarios/:id`, `/admin/usuarios/:id/editar` exibem o `InnerPageHeader` com título e botão voltar.
- **CA-05** (RF-06): Em viewport mobile (xs) o header é legível e o botão de voltar é acessível sem scroll horizontal.
- **CA-06** (RF-08): O `InnerPageHeader` aparece abaixo do AppBar global, no topo do conteúdo da página.

---

## 13. Riscos e Decisoes em Aberto

| Item | Descrição | Decisão |
|---|---|---|
| `router.back()` em deep link | Se usuário acessar `/visitantes/123/editar` diretamente (sem histórico), `router.back()` vai para página externa ao app | Usar `backHref` explícito nas páginas que podem ser acessadas por deep link |
| Posicionamento na view vs no page | Pode ser colocado no `page.tsx` (Server Component, sem useRouter) ou dentro da view (Client Component) | Colocar dentro da view Client Component para ter acesso ao router |
| Título em page.tsx vs prop | Título pode vir de dados dinâmicos (ex: nome do visitante no editar) | Aceitar como prop string — view pode fazer fetch e passar dinâmicamente |

---

## 14. Plano de Implementacao (ordem)

1. Criar `inner-page-header.tsx` em `src/frontend/components/layout/`
2. Adicionar `InnerPageHeader` em `visitante-form.tsx` (ou view de novo visitante)
3. Adicionar `InnerPageHeader` em view de edição de visitante
4. Adicionar `InnerPageHeader` em `usuario-detail.tsx`
5. Adicionar `InnerPageHeader` em view de edição de usuário
6. Integrar com `perfil-view.tsx` ao implementar SPEC 015
7. Rodar testes e lint

---

## 15. Estrategia de Testes

### Componente
- `inner-page-header.test.tsx`:
  - Renderiza título recebido via prop
  - Botão "Voltar" está presente e acessível
  - Dado `backHref` não informado: clicar em "Voltar" chama `router.back()`
  - Dado `backHref="/visitantes"`: clicar em "Voltar" chama `router.push("/visitantes")`
  - Mock de `next/navigation` com `useRouter`

### Integração nas views
- Verificar nos testes das views afetadas que o título correto é renderizado e o botão voltar está presente

---

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
