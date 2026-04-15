import { beforeEach, describe, expect, it, vi } from "vitest";

import { validateUserInviteService } from "@/modules/usuarios/services/validate-user-invite.service";

const findUserInviteByTokenRepositoryMock = vi.fn();

vi.mock("@/modules/usuarios/repositories/find-user-invite-by-token.repository", () => ({
  findUserInviteByTokenRepository: (input: unknown) =>
    findUserInviteByTokenRepositoryMock(input),
}));

describe("validateUserInviteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna valid false quando convite nao existe", async () => {
    findUserInviteByTokenRepositoryMock.mockResolvedValueOnce(null);

    const result = await validateUserInviteService("token-invalido");

    expect(result).toEqual({ valid: false });
  });

  it("retorna valid true e role quando convite esta disponivel", async () => {
    findUserInviteByTokenRepositoryMock.mockResolvedValueOnce({ role: "ADMIN" });

    const result = await validateUserInviteService("token-valido");

    expect(result).toEqual({ valid: true, role: "ADMIN" });
  });
});
