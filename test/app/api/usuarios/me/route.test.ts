import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, PUT } from "@/app/api/usuarios/me/route";
import { requireAuthSessionForApi } from "@/lib/require-auth-session";
import { AppError } from "@/shared/errors/app-error";

const getMyProfileServiceMock = vi.fn();
const updateMyProfileServiceMock = vi.fn();

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

vi.mock("@/modules/usuarios/services/get-my-profile.service", () => ({
  getMyProfileService: (userId: string) => getMyProfileServiceMock(userId),
}));

vi.mock("@/modules/usuarios/services/update-my-profile.service", () => ({
  updateMyProfileService: (userId: string, data: unknown) =>
    updateMyProfileServiceMock(userId, data),
}));

describe("/api/usuarios/me route", () => {
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

  it("GET retorna 200 com dados do perfil", async () => {
    getMyProfileServiceMock.mockResolvedValueOnce({
      id: "user-1",
      nome: "Maria",
      sobrenome: "Silva",
      email: "maria@test.com",
      role: "STAFF",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.perfil.email).toBe("maria@test.com");
  });

  it("GET retorna 401 sem sessao", async () => {
    vi.mocked(requireAuthSessionForApi).mockRejectedValueOnce(
      new AppError("Nao autenticado", 401, "UNAUTHORIZED"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("PUT retorna 200 ao atualizar dados validos", async () => {
    updateMyProfileServiceMock.mockResolvedValueOnce(undefined);

    const request = new Request("http://localhost/api/usuarios/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: "Maria", sobrenome: "Silva" }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("PUT retorna 400 com dados invalidos", async () => {
    const request = new Request("http://localhost/api/usuarios/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: "M", sobrenome: "S" }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});