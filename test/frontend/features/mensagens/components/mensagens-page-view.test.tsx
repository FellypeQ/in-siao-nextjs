import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MensagensPageView } from "@/frontend/features/mensagens/components/mensagens-page-view"

describe("MensagensPageView", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("carrega e exibe templates ordenados", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: "tpl-2", title: "Segundo", body: "B", order: 2 },
          { id: "tpl-1", title: "Primeiro", body: "A", order: 1 }
        ]
      })
    )

    render(<MensagensPageView />)

    expect(await screen.findByText("Mensagens")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Ordem #1")).toBeInTheDocument()
      expect(screen.getByText("Primeiro")).toBeInTheDocument()
    })
  })

  it("envia POST ao criar novo template", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "tpl-1", title: "Boas-vindas", body: "Ola", order: 1 })
      })

    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<MensagensPageView />)

    await user.click(await screen.findByRole("button", { name: "Adicionar template" }))
    const textboxes = screen.getAllByRole("textbox")
    await user.type(textboxes[0], "Boas-vindas")
    await user.type(textboxes[1], "Ola")
    await user.click(screen.getByRole("button", { name: "Criar" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/mensagens",
        expect.objectContaining({ method: "POST" })
      )
      expect(screen.getByText("Boas-vindas")).toBeInTheDocument()
    })
  })
})
