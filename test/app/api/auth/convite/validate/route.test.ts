import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/auth/convite/validate/route";

const validateUserInviteServiceMock = vi.fn();

vi.mock("@/modules/usuarios/services/validate-user-invite.service", () => ({
  validateUserInviteService: (token: string) =>
    validateUserInviteServiceMock(token),
}));

describe("/api/auth/convite/validate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna valid false sem token", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/auth/convite/validate"),
    );

    const body = (await response.json()) as { success: boolean; valid: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.valid).toBe(false);
  });

  it("retorna valid true para token valido", async () => {
    validateUserInviteServiceMock.mockResolvedValueOnce({
      valid: true,
      role: "STAFF",
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/api/auth/convite/validate?token=abc-token",
      ),
    );

    const body = (await response.json()) as {
      success: boolean;
      valid: boolean;
      role?: string;
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.valid).toBe(true);
    expect(body.role).toBe("STAFF");
  });
});
