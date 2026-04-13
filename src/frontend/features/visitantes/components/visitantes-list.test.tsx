import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VisitantesList } from "@/frontend/features/visitantes/components/visitantes-list"

const pushMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn()
  })
}))

describe("VisitantesList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza lista e navega para novo cadastro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, items: [], totalPages: 1 })
      })
    )

    const user = userEvent.setup()

    render(<VisitantesList />)

    expect(await screen.findByText("Visitantes")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Cadastrar visitante" }))

    expect(pushMock).toHaveBeenCalledWith("/visitantes/novo")
  })

  it("abre modal ao clicar em item", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            items: [
              {
                id: "member-1",
                name: "Visitante Um",
                birthDate: "1990-01-01T00:00:00.000Z",
                phone: null,
                createdAt: "2026-01-01T00:00:00.000Z"
              }
            ],
            totalPages: 1
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            visitante: {
              member: {
                id: "member-1",
                name: "Visitante Um",
                birthDate: "1990-01-01T00:00:00.000Z",
                phone: null,
                baptized: false,
                createdAt: "2026-01-01T00:00:00.000Z"
              },
              visitorProfile: {
                actualChurch: "NONE",
                howKnow: "EVENT",
                howKnowOtherAnswer: null
              },
              prayers: [],
              familyRelationships: []
            }
          })
        })
    )

    const user = userEvent.setup()

    render(<VisitantesList />)

    await user.click(await screen.findByText("Visitante Um"))

    await waitFor(() => {
      expect(screen.getByText("Detalhes do visitante")).toBeInTheDocument()
    })
  })
})
