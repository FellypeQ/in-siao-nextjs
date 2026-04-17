import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticatedShell } from "@/frontend/components/layout/authenticated-shell";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AuthenticatedShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
    );
  });

  it("renderiza elementos principais de navegacao", () => {
    render(
      <AuthenticatedShell
        user={{ nome: "Maria", email: "maria@example.com", role: "ADMIN" }}
      >
        <div>Conteudo Home</div>
      </AuthenticatedShell>,
    );

    expect(screen.getByRole("link", { name: "Siao" })).toBeInTheDocument();
    expect(screen.getByText("Conteudo Home")).toBeInTheDocument();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Usuarios").length).toBeGreaterThan(0);
  });

  it("nao renderiza item Usuarios para STAFF", () => {
    render(
      <AuthenticatedShell
        user={{ nome: "Joao", email: "joao@example.com", role: "STAFF" }}
      >
        <div>Conteudo Home</div>
      </AuthenticatedShell>,
    );

    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
  });

  it("executa logout e redireciona para login", async () => {
    const user = userEvent.setup();

    render(
      <AuthenticatedShell
        user={{ nome: "Maria", email: "maria@example.com", role: "ADMIN" }}
      >
        <div>Conteudo Home</div>
      </AuthenticatedShell>,
    );

    await user.click(screen.getByRole("button", { name: /Maria/i }));
    await user.click(screen.getByRole("menuitem", { name: "Logout" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/sign-out", {
        method: "POST",
      });
      expect(pushMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
