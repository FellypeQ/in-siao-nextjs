import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PerfilView } from "@/frontend/features/perfil/components/perfil-view";

describe("PerfilView", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("renderiza dados do perfil e campo email desabilitado", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        perfil: {
          id: "user-1",
          nome: "Maria",
          sobrenome: "Silva",
          email: "maria@test.com",
          role: "STAFF",
        },
      }),
    } as Response);

    render(<PerfilView />);

    await waitFor(() => {
      expect(screen.getByText("Meu Perfil")).toBeInTheDocument();
    });

    const emailField = screen.getByLabelText("Email");

    expect(emailField).toBeDisabled();
    expect(screen.getByRole("button", { name: /salvar dados/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /atualizar senha/i }),
    ).toBeInTheDocument();
  });
});