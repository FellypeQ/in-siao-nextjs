import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateMyPasswordService } from "@/modules/usuarios/services/update-my-password.service";

const findUsuarioByIdRepositoryMock = vi.fn();
const updateUserPasswordRepositoryMock = vi.fn();

vi.mock("@/modules/usuarios/repositories/find-usuario-by-id.repository", () => ({
  findUsuarioByIdRepository: (id: string) => findUsuarioByIdRepositoryMock(id),
}));

vi.mock("@/modules/auth/repositories/update-user-password.repository", () => ({
  updateUserPasswordRepository: (userId: string, passwordHash: string) =>
    updateUserPasswordRepositoryMock(userId, passwordHash),
}));

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

import { compare, hash } from "bcryptjs";

describe("updateMyPasswordService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atualiza hash quando senha atual confere", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "user-1",
      passwordHash: "old-hash",
    });
    vi.mocked(compare).mockResolvedValueOnce(true as never);
    vi.mocked(hash).mockResolvedValueOnce("new-hash" as never);

    await updateMyPasswordService("user-1", {
      senhaAtual: "Senha@123",
      novaSenha: "NovaSenha@123",
      confirmacaoNovaSenha: "NovaSenha@123",
    });

    expect(updateUserPasswordRepositoryMock).toHaveBeenCalledWith(
      "user-1",
      "new-hash",
    );
  });

  it("lanca erro quando senha atual esta incorreta", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "user-1",
      passwordHash: "old-hash",
    });
    vi.mocked(compare).mockResolvedValueOnce(false as never);

    await expect(
      updateMyPasswordService("user-1", {
        senhaAtual: "SenhaErrada@123",
        novaSenha: "NovaSenha@123",
        confirmacaoNovaSenha: "NovaSenha@123",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "SENHA_ATUAL_INCORRETA",
    });
    expect(updateUserPasswordRepositoryMock).not.toHaveBeenCalled();
  });
});