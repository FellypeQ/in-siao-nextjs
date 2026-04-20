import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VisitanteMensagensStepper } from "@/frontend/features/visitantes/components/visitante-mensagens-stepper"

describe("VisitanteMensagensStepper", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal("open", vi.fn())
  })

  it("renderiza passos e botao de envio", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          templates: [
            { id: "tpl-1", title: "Mensagem 1", body: "A", order: 1 },
            { id: "tpl-2", title: "Mensagem 2", body: "B", order: 2 }
          ],
          sentLogs: [{ id: "log-1", messageTemplateId: "tpl-1", messageTitle: "Mensagem 1", sentAt: "2026-01-01" }],
          nextTemplate: { id: "tpl-2", title: "Mensagem 2", processedBody: "B" }
        })
      })
    )

    render(<VisitanteMensagensStepper visitanteId="member-1" visitantePhone="11999999999" canEnviar />)

    expect(await screen.findByText("Mensagem 1")).toBeInTheDocument()
    expect(screen.getByText("Mensagem 2")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Enviar próxima mensagem" })).toBeInTheDocument()
  })

  it("registra envio e abre whatsapp apos confirmar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          templates: [{ id: "tpl-1", title: "Mensagem 1", body: "Ola", order: 1 }],
          sentLogs: [],
          nextTemplate: { id: "tpl-1", title: "Mensagem 1", processedBody: "Ola" }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "log-1" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          templates: [{ id: "tpl-1", title: "Mensagem 1", body: "Ola", order: 1 }],
          sentLogs: [{ id: "log-1", messageTemplateId: "tpl-1", messageTitle: "Mensagem 1", sentAt: "2026-01-01" }],
          nextTemplate: null
        })
      })

    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<VisitanteMensagensStepper visitanteId="member-1" visitantePhone="11999999999" canEnviar />)

    await user.click(await screen.findByRole("button", { name: "Enviar próxima mensagem" }))
    await user.click(screen.getByRole("button", { name: "Confirmar e abrir WhatsApp" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/visitantes/member-1/mensagens",
        expect.objectContaining({ method: "POST" })
      )
      expect(window.open).toHaveBeenCalled()
    })
  })
})
