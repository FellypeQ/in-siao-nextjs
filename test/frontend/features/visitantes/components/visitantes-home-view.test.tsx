import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VisitantesHomeView } from "@/frontend/features/visitantes/components/visitantes-home-view"

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock("@mui/x-charts/LineChart", () => ({
  LineChart: () => <div data-testid="visitantes-chart" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => [],
  } as Response)
})

describe("VisitantesHomeView", () => {
  it("exibe card Cadastrar Visitante quando tem permissão VISITANTES_CADASTRAR", async () => {
    render(<VisitantesHomeView permissions={["VISITANTES_CADASTRAR"]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.getByText("Cadastrar Visitante")).toBeInTheDocument()
    })
  })

  it("oculta card Cadastrar Visitante sem permissão VISITANTES_CADASTRAR", async () => {
    render(<VisitantesHomeView permissions={[]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.queryByText("Cadastrar Visitante")).not.toBeInTheDocument()
    })
  })

  it("exibe card Listar Visitantes quando tem permissão VISITANTES_LISTAR", async () => {
    render(<VisitantesHomeView permissions={["VISITANTES_LISTAR"]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.getByText("Listar Visitantes")).toBeInTheDocument()
    })
  })

  it("oculta card Listar Visitantes sem permissão VISITANTES_LISTAR", async () => {
    render(<VisitantesHomeView permissions={[]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.queryByText("Listar Visitantes")).not.toBeInTheDocument()
    })
  })

  it("exibe ambos os cards para ADMIN independente das permissões", async () => {
    render(<VisitantesHomeView permissions={[]} role="ADMIN" />)

    await waitFor(() => {
      expect(screen.getByText("Cadastrar Visitante")).toBeInTheDocument()
      expect(screen.getByText("Listar Visitantes")).toBeInTheDocument()
      expect(screen.getByText("Mensagens")).toBeInTheDocument()
    })
  })

  it("exibe card Mensagens com permissao de envio", async () => {
    render(<VisitantesHomeView permissions={["MENSAGENS_ENVIAR"]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.getByText("Mensagens")).toBeInTheDocument()
    })
  })

  it("oculta card Mensagens sem permissoes de mensagens", async () => {
    render(<VisitantesHomeView permissions={["VISITANTES_LISTAR"]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.queryByText("Mensagens")).not.toBeInTheDocument()
    })
  })

  it("exibe o gráfico após carregar os dados", async () => {
    render(<VisitantesHomeView permissions={[]} role="STAFF" />)

    await waitFor(() => {
      expect(screen.getByTestId("visitantes-chart")).toBeInTheDocument()
    })
  })

  it("busca dados do gráfico em /api/visitantes/chart", async () => {
    render(<VisitantesHomeView permissions={[]} role="STAFF" />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/visitantes/chart")
    })
  })
})
