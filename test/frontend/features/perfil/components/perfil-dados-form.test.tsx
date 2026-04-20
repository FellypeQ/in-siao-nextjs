import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PerfilDadosForm } from "@/frontend/features/perfil/components/perfil-dados-form";

describe("PerfilDadosForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("submit valido chama API e exibe sucesso", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const onUpdated = vi.fn();
    const user = userEvent.setup();

    render(
      <PerfilDadosForm
        nome="Maria"
        sobrenome="Silva"
        email="maria@test.com"
        onUpdated={onUpdated}
      />,
    );

    const nomeField = screen.getByRole("textbox", { name: /^nome/i });

    await user.clear(nomeField);
    await user.type(nomeField, "Maria Clara");
    await user.click(screen.getByRole("button", { name: /salvar dados/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/usuarios/me", expect.any(Object));
    });

    expect(onUpdated).toHaveBeenCalledWith("Maria Clara", "Silva");
    expect(screen.getByText(/dados atualizados com sucesso/i)).toBeInTheDocument();
  });
});