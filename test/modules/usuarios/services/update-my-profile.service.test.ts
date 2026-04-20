import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateMyProfileService } from "@/modules/usuarios/services/update-my-profile.service";

const findUsuarioByIdRepositoryMock = vi.fn();
const updateUserProfileRepositoryMock = vi.fn();
const encryptSurnameMock = vi.fn();

vi.mock("@/modules/usuarios/repositories/find-usuario-by-id.repository", () => ({
  findUsuarioByIdRepository: (id: string) => findUsuarioByIdRepositoryMock(id),
}));

vi.mock("@/modules/usuarios/repositories/update-user-profile.repository", () => ({
  updateUserProfileRepository: (input: unknown) => updateUserProfileRepositoryMock(input),
}));

vi.mock("@/lib/surname-crypto", () => ({
  encryptSurname: (value: string) => encryptSurnameMock(value),
}));

describe("updateMyProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atualiza nome e sobrenome criptografado", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({ id: "user-1" });
    encryptSurnameMock.mockReturnValueOnce("sobrenome-enc");

    await updateMyProfileService("user-1", {
      nome: "Maria ",
      sobrenome: " Silva",
    });

    expect(updateUserProfileRepositoryMock).toHaveBeenCalledWith({
      userId: "user-1",
      nome: "Maria",
      sobrenomeEncrypted: "sobrenome-enc",
    });
  });

  it("lanca erro quando usuario nao existe", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce(null);

    await expect(
      updateMyProfileService("missing-user", {
        nome: "Maria",
        sobrenome: "Silva",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  });
});