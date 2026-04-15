import { beforeEach, describe, expect, it, vi } from "vitest";

import { signUpWithInviteAuthService } from "@/modules/auth/services/sign-up-with-invite-auth.service";

const findUserByEmailRepositoryMock = vi.fn();
const findUserInviteByTokenRepositoryMock = vi.fn();
const createUserRepositoryMock = vi.fn();
const useUserInviteRepositoryMock = vi.fn();
const transactionMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: (callback: (tx: unknown) => Promise<unknown>) =>
      transactionMock(callback),
  },
}));

vi.mock("@/modules/auth/repositories/find-user-by-email.repository", () => ({
  findUserByEmailRepository: (email: string) => findUserByEmailRepositoryMock(email),
}));

vi.mock("@/modules/usuarios/repositories/find-user-invite-by-token.repository", () => ({
  findUserInviteByTokenRepository: (input: unknown, tx: unknown) =>
    findUserInviteByTokenRepositoryMock(input, tx),
}));

vi.mock("@/modules/auth/repositories/create-user.repository", () => ({
  createUserRepository: (input: unknown, tx: unknown) => createUserRepositoryMock(input, tx),
}));

vi.mock("@/modules/usuarios/repositories/use-user-invite.repository", () => ({
  useUserInviteRepository: (input: unknown, tx: unknown) =>
    useUserInviteRepositoryMock(input, tx),
}));

describe("signUpWithInviteAuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation(async (callback) => callback({}));
  });

  it("cria usuario com role do convite e invalida token", async () => {
    findUserByEmailRepositoryMock.mockResolvedValueOnce(null);
    findUserInviteByTokenRepositoryMock.mockResolvedValueOnce({
      token: "invite-token",
      role: "STAFF",
    });
    createUserRepositoryMock.mockResolvedValueOnce({
      id: "user-1",
      nome: "Maria",
      email: "maria@example.com",
      role: "STAFF",
    });
    useUserInviteRepositoryMock.mockResolvedValueOnce(1);

    const result = await signUpWithInviteAuthService({
      nome: "Maria",
      sobrenome: "Souza",
      email: "maria@example.com",
      senha: "Senha@123",
      token: "ec5f18d3-7a17-44be-ac55-150f7f75a95d",
    });

    expect(result).toEqual({
      id: "user-1",
      nome: "Maria",
      email: "maria@example.com",
      role: "STAFF",
    });
    expect(useUserInviteRepositoryMock).toHaveBeenCalled();
  });

  it("rejeita quando email ja existe", async () => {
    findUserByEmailRepositoryMock.mockResolvedValueOnce({ id: "user-1" });

    await expect(
      signUpWithInviteAuthService({
        nome: "Maria",
        sobrenome: "Souza",
        email: "maria@example.com",
        senha: "Senha@123",
        token: "ec5f18d3-7a17-44be-ac55-150f7f75a95d",
      }),
    ).rejects.toMatchObject({ code: "EMAIL_ALREADY_EXISTS" });
  });

  it("rejeita quando token e invalido", async () => {
    findUserByEmailRepositoryMock.mockResolvedValueOnce(null);
    findUserInviteByTokenRepositoryMock.mockResolvedValueOnce(null);

    await expect(
      signUpWithInviteAuthService({
        nome: "Maria",
        sobrenome: "Souza",
        email: "maria@example.com",
        senha: "Senha@123",
        token: "ec5f18d3-7a17-44be-ac55-150f7f75a95d",
      }),
    ).rejects.toMatchObject({ code: "INVALID_INVITE_TOKEN" });
  });
});
