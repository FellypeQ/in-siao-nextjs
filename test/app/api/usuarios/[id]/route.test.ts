import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH } from "@/app/api/usuarios/[id]/route";

const requireAdminSessionForApiMock = vi.fn();
const getUsuarioServiceMock = vi.fn();
const updateUsuarioServiceMock = vi.fn();
const softDeleteUsuarioServiceMock = vi.fn();

vi.mock("@/lib/require-admin-session", () => ({
  requireAdminSessionForApi: () => requireAdminSessionForApiMock(),
}));

vi.mock("@/modules/usuarios/services/get-usuario.service", () => ({
  getUsuarioService: (id: string) => getUsuarioServiceMock(id),
}));

vi.mock("@/modules/usuarios/services/update-usuario.service", () => ({
  updateUsuarioService: (input: unknown) => updateUsuarioServiceMock(input),
}));

vi.mock("@/modules/usuarios/services/soft-delete-usuario.service", () => ({
  softDeleteUsuarioService: (input: unknown) =>
    softDeleteUsuarioServiceMock(input),
}));

describe("/api/usuarios/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionForApiMock.mockResolvedValue({
      sub: "admin-1",
      role: "ADMIN",
    });
  });

  it("GET retorna detalhe do usuario", async () => {
    getUsuarioServiceMock.mockResolvedValueOnce({ id: "user-1" });

    const response = await GET(
      new Request("http://localhost/api/usuarios/user-1"),
      {
        params: Promise.resolve({ id: "user-1" }),
      },
    );

    const body = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("PATCH atualiza usuario", async () => {
    updateUsuarioServiceMock.mockResolvedValueOnce({ id: "user-1" });
    getUsuarioServiceMock.mockResolvedValueOnce({ id: "user-1" });

    const request = new Request("http://localhost/api/usuarios/user-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: "Novo Nome" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "user-1" }),
    });

    const body = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("DELETE aplica soft delete", async () => {
    softDeleteUsuarioServiceMock.mockResolvedValueOnce({ success: true });

    const response = await DELETE(
      new Request("http://localhost/api/usuarios/user-1"),
      {
        params: Promise.resolve({ id: "user-1" }),
      },
    );

    const body = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
