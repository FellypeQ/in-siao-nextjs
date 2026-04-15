import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsuariosTable } from "@/frontend/features/usuarios/components/usuarios-table";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
  }),
}));

describe("UsuariosTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza tabela com usuarios", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          usuarios: [
            {
              id: "user-1",
              nome: "Maria",
              sobrenome: "Silva",
              email: "maria@example.com",
              role: "ADMIN",
              status: "ATIVO",
              deletedAt: null,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
      }),
    );

    render(<UsuariosTable currentUserId="admin-1" />);

    expect(await screen.findByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  });

  it("abre dialog de confirmacao e cancela exclusao", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          usuarios: [
            {
              id: "user-1",
              nome: "Maria",
              sobrenome: "Silva",
              email: "maria@example.com",
              role: "ADMIN",
              status: "ATIVO",
              deletedAt: null,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
      }),
    );

    const user = userEvent.setup();

    render(<UsuariosTable currentUserId="admin-1" />);

    await user.click(await screen.findByRole("button", { name: "Excluir" }));

    expect(screen.getByText("Confirmar exclusao")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() => {
      expect(screen.queryByText("Confirmar exclusao")).not.toBeInTheDocument();
    });
  });
});
