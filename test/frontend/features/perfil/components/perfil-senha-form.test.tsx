import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PerfilSenhaForm } from "@/frontend/features/perfil/components/perfil-senha-form";

describe("PerfilSenhaForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("exibe erro quando API retorna senha atual incorreta", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "SENHA_ATUAL_INCORRETA", message: "Senha atual incorreta" },
      }),
    } as Response);

    const user = userEvent.setup();

    render(<PerfilSenhaForm />);

    const passwordFields = screen.getAllByLabelText(/senha/i);

    await user.type(passwordFields[0], "SenhaErrada@123");
    await user.type(passwordFields[1], "SenhaNova@123");
    await user.type(passwordFields[2], "SenhaNova@123");
    await user.click(screen.getByRole("button", { name: /atualizar senha/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByRole("alert").textContent).toMatch(/senha atual incorreta/i);
  });
});