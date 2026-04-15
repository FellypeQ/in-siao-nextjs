import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/usuarios/convites/route";

const requireAdminSessionForApiMock = vi.fn();
const generateUserInviteServiceMock = vi.fn();

vi.mock("@/lib/require-admin-session", () => ({
  requireAdminSessionForApi: () => requireAdminSessionForApiMock(),
}));

vi.mock("@/modules/usuarios/services/generate-user-invite.service", () => ({
  generateUserInviteService: (input: unknown) => generateUserInviteServiceMock(input),
}));

describe("/api/usuarios/convites route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 201 ao gerar convite com sessao ADMIN", async () => {
    requireAdminSessionForApiMock.mockResolvedValueOnce({ sub: "admin-1" });
    generateUserInviteServiceMock.mockResolvedValueOnce({
      token: "token-1",
      link: "http://localhost:3000/cadastro?token=token-1",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/usuarios/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "STAFF" }),
      }),
    );

    const body = (await response.json()) as {
      success: boolean;
      token: string;
      link: string;
    };

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.token).toBe("token-1");
    expect(generateUserInviteServiceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "STAFF",
        createdById: "admin-1",
      }),
    );
  });

  it("retorna 400 para payload invalido", async () => {
    requireAdminSessionForApiMock.mockResolvedValueOnce({ sub: "admin-1" });

    const response = await POST(
      new Request("http://localhost:3000/api/usuarios/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "INVALID" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(generateUserInviteServiceMock).not.toHaveBeenCalled();
  });
});
