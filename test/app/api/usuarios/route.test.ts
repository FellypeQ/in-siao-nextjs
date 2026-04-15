import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/usuarios/route";

const requireAdminSessionForApiMock = vi.fn();
const listUsuariosServiceMock = vi.fn();

vi.mock("@/lib/require-admin-session", () => ({
  requireAdminSessionForApi: () => requireAdminSessionForApiMock(),
}));

vi.mock("@/modules/usuarios/services/list-usuarios.service", () => ({
  listUsuariosService: () => listUsuariosServiceMock(),
}));

describe("/api/usuarios route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 200 com lista de usuarios para ADMIN", async () => {
    requireAdminSessionForApiMock.mockResolvedValueOnce({
      sub: "admin-1",
      role: "ADMIN",
    });
    listUsuariosServiceMock.mockResolvedValueOnce([]);

    const response = await GET();
    const body = (await response.json()) as {
      success: boolean;
      usuarios: unknown[];
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.usuarios).toEqual([]);
  });
});
