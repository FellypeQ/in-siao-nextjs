import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ExportVisitantesButton } from "@/frontend/features/visitantes/components/export-visitantes-button"

describe("ExportVisitantesButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn().mockReturnValue("blob:fake"),
        revokeObjectURL: vi.fn()
      })
    )
  })

  it("envia filtros de periodo na query da exportacao", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["content"]),
      headers: new Headers({
        "content-disposition": "attachment; filename=\"visitantes-2026-04-14.xlsx\""
      })
    })

    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()

    render(
      <ExportVisitantesButton
        onError={vi.fn()}
        createdFrom="2026-04-01"
        createdTo="2026-04-14"
      />
    )

    await user.click(screen.getByRole("button", { name: "Exportar Excel" }))

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/visitantes/export?createdFrom=2026-04-01&createdTo=2026-04-14"
    )
  })

  it("retorna erro local quando periodo e invalido", async () => {
    const onError = vi.fn()
    const fetchMock = vi.fn()

    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()

    render(
      <ExportVisitantesButton
        onError={onError}
        createdFrom="2026-04-20"
        createdTo="2026-04-10"
      />
    )

    await user.click(screen.getByRole("button", { name: "Exportar Excel" }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      "Periodo de exportacao invalido: a data inicial deve ser menor ou igual a final"
    )
  })
})
