import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMyProfileService } from "@/modules/usuarios/services/get-my-profile.service";

const findUsuarioByIdRepositoryMock = vi.fn();
const decryptSurnameMock = vi.fn();

vi.mock("@/modules/usuarios/repositories/find-usuario-by-id.repository", () => ({
  findUsuarioByIdRepository: (id: string) => findUsuarioByIdRepositoryMock(id),
}));

vi.mock("@/lib/surname-crypto", () => ({
  decryptSurname: (value: string) => decryptSurnameMock(value),
}));

describe("getMyProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna dto do perfil", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "user-1",
      nome: "Maria",
      sobrenomeEncrypted: "enc",
      email: "maria@test.com",
      role: "STAFF",
    });
    decryptSurnameMock.mockReturnValueOnce("Silva");

    const result = await getMyProfileService("user-1");

    expect(result).toEqual({
      id: "user-1",
      nome: "Maria",
      sobrenome: "Silva",
      email: "maria@test.com",
      role: "STAFF",
    });
  });

  it("lanca erro quando usuario nao existe", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce(null);

    await expect(getMyProfileService("missing-user")).rejects.toMatchObject({
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  });
});