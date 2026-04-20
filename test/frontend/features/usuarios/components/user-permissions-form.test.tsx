import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserPermissionsForm } from "@/frontend/features/usuarios/components/user-permissions-form"
import { PERMISSIONS_BY_MODULE } from "@/shared/constants/permissions"

describe("UserPermissionsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza categorias de permissoes em blocos e mostra permissoes de Mensagens", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        permissions: ["VISITANTES_LISTAR", "MENSAGENS_GERENCIAR"],
      }),
    })

    vi.stubGlobal("fetch", fetchMock)

    render(<UserPermissionsForm usuarioId="user-1" />)

    expect(await screen.findByText("Permissoes")).toBeInTheDocument()
    expect(await screen.findByText("Mensagens")).toBeInTheDocument()
    expect(screen.getByLabelText("Gerenciar mensagens")).toBeInTheDocument()
    expect(screen.getByLabelText("Enviar mensagens")).toBeInTheDocument()

    const categoryContainers = screen.getAllByTestId(/permission-category-/)
    const itemContainers = screen.getAllByTestId(/permission-items-/)

    expect(categoryContainers).toHaveLength(Object.keys(PERMISSIONS_BY_MODULE).length)
    expect(itemContainers).toHaveLength(Object.keys(PERMISSIONS_BY_MODULE).length)
    expect(fetchMock).toHaveBeenCalledWith("/api/usuarios/user-1/permissoes")
  })
})
