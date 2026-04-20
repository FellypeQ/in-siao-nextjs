import { beforeEach, describe, expect, it, vi } from "vitest";

import { PUT } from "@/app/api/usuarios/me/senha/route";
import { requireAuthSessionForApi } from "@/lib/require-auth-session";
import { AppError } from "@/shared/errors/app-error";

const updateMyPasswordServiceMock = vi.fn();

vi.mock("@/lib/require-auth-session", () => ({
  requireAuthSessionForApi: vi.fn().mockResolvedValue({
    sub: "user-1",
    role: "STAFF",
    permissions: [],
    nome: "Usuario",
    email: "user@test.com",
    iat: 0,
    exp: 0,
  }),
}));

vi.mock("@/modules/usuarios/services/update-my-password.service", () => ({
  updateMyPasswordService: (userId: string, data: unknown) =>
    updateMyPasswordServiceMock(userId, data),
}));

describe("/api/usuarios/me/senha route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuthSessionForApi).mockResolvedValue({
      sub: "user-1",
      role: "STAFF",
      permissions: [],
      nome: "Usuario",
      email: "user@test.com",
      iat: 0,
      exp: 0,
    });
  });

  it("PUT retorna 200 quando senha e alterada", async () => {
    updateMyPasswordServiceMock.mockResolvedValueOnce(undefined);

    const request = new Request("http://localhost/api/usuarios/me/senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senhaAtual: "SenhaAtual@123",
        novaSenha: "SenhaNova@123",
        confirmacaoNovaSenha: "SenhaNova@123",
      }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("PUT retorna 400 quando senha atual esta incorreta", async () => {
    updateMyPasswordServiceMock.mockRejectedValueOnce(
      new AppError("Senha atual incorreta", 400, "SENHA_ATUAL_INCORRETA"),
    );

    const request = new Request("http://localhost/api/usuarios/me/senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senhaAtual: "SenhaErrada@123",
        novaSenha: "SenhaNova@123",
        confirmacaoNovaSenha: "SenhaNova@123",
      }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("SENHA_ATUAL_INCORRETA");
  });

  it("PUT retorna 400 para validacao de schema", async () => {
    const request = new Request("http://localhost/api/usuarios/me/senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senhaAtual: "SenhaAtual@123",
        novaSenha: "fraca",
        confirmacaoNovaSenha: "fraca",
      }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PUT retorna 401 sem sessao", async () => {
    vi.mocked(requireAuthSessionForApi).mockRejectedValueOnce(
      new AppError("Nao autenticado", 401, "UNAUTHORIZED"),
    );

    const request = new Request("http://localhost/api/usuarios/me/senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senhaAtual: "SenhaAtual@123",
        novaSenha: "SenhaNova@123",
        confirmacaoNovaSenha: "SenhaNova@123",
      }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});