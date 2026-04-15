import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateUsuarioService } from "@/modules/usuarios/services/update-usuario.service";

const findUsuarioByIdRepositoryMock = vi.fn();
const findUsuarioByEmailRepositoryMock = vi.fn();
const countActiveAdminsRepositoryMock = vi.fn();
const updateUsuarioRepositoryMock = vi.fn();

vi.mock(
  "@/modules/usuarios/repositories/find-usuario-by-id.repository",
  () => ({
    findUsuarioByIdRepository: (id: string) =>
      findUsuarioByIdRepositoryMock(id),
  }),
);

vi.mock(
  "@/modules/usuarios/repositories/find-usuario-by-email.repository",
  () => ({
    findUsuarioByEmailRepository: (email: string) =>
      findUsuarioByEmailRepositoryMock(email),
  }),
);

vi.mock(
  "@/modules/usuarios/repositories/count-active-admins.repository",
  () => ({
    countActiveAdminsRepository: () => countActiveAdminsRepositoryMock(),
  }),
);

vi.mock("@/modules/usuarios/repositories/update-usuario.repository", () => ({
  updateUsuarioRepository: (input: unknown) =>
    updateUsuarioRepositoryMock(input),
}));

describe("updateUsuarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia email duplicado", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "user-1",
      role: "STAFF",
      deletedAt: null,
    });
    findUsuarioByEmailRepositoryMock.mockResolvedValueOnce({ id: "user-2" });

    await expect(
      updateUsuarioService({
        id: "user-1",
        actorId: "admin-1",
        data: { email: "duplicado@example.com" },
      }),
    ).rejects.toMatchObject({ code: "EMAIL_ALREADY_EXISTS" });
  });

  it("bloqueia rebaixamento do ultimo admin", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "admin-1",
      role: "ADMIN",
      deletedAt: null,
    });
    countActiveAdminsRepositoryMock.mockResolvedValueOnce(1);

    await expect(
      updateUsuarioService({
        id: "admin-1",
        actorId: "admin-2",
        data: { role: "STAFF" },
      }),
    ).rejects.toMatchObject({ code: "LAST_ADMIN_PROTECTION" });
  });

  it("atualiza usuario em fluxo feliz", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "user-1",
      role: "STAFF",
      deletedAt: null,
    });
    findUsuarioByEmailRepositoryMock.mockResolvedValueOnce(null);
    updateUsuarioRepositoryMock.mockResolvedValueOnce({ id: "user-1" });

    await updateUsuarioService({
      id: "user-1",
      actorId: "admin-1",
      data: {
        nome: "Novo Nome",
        sobrenome: "Novo Sobrenome",
        email: "novo@example.com",
        role: "STAFF",
      },
    });

    expect(updateUsuarioRepositoryMock).toHaveBeenCalled();
  });
});
