import { beforeEach, describe, expect, it, vi } from "vitest";

import { softDeleteUsuarioService } from "@/modules/usuarios/services/soft-delete-usuario.service";

const findUsuarioByIdRepositoryMock = vi.fn();
const countActiveAdminsRepositoryMock = vi.fn();
const softDeleteUsuarioRepositoryMock = vi.fn();

vi.mock(
  "@/modules/usuarios/repositories/find-usuario-by-id.repository",
  () => ({
    findUsuarioByIdRepository: (id: string) =>
      findUsuarioByIdRepositoryMock(id),
  }),
);

vi.mock(
  "@/modules/usuarios/repositories/count-active-admins.repository",
  () => ({
    countActiveAdminsRepository: () => countActiveAdminsRepositoryMock(),
  }),
);

vi.mock(
  "@/modules/usuarios/repositories/soft-delete-usuario.repository",
  () => ({
    softDeleteUsuarioRepository: (id: string) =>
      softDeleteUsuarioRepositoryMock(id),
  }),
);

describe("softDeleteUsuarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia auto exclusao", async () => {
    await expect(
      softDeleteUsuarioService({
        id: "admin-1",
        actorId: "admin-1",
      }),
    ).rejects.toMatchObject({ code: "SELF_DELETE_FORBIDDEN" });
  });

  it("executa soft delete em fluxo feliz", async () => {
    findUsuarioByIdRepositoryMock.mockResolvedValueOnce({
      id: "staff-1",
      role: "STAFF",
      deletedAt: null,
    });
    softDeleteUsuarioRepositoryMock.mockResolvedValueOnce({ id: "staff-1" });

    const result = await softDeleteUsuarioService({
      id: "staff-1",
      actorId: "admin-1",
    });

    expect(result.success).toBe(true);
    expect(softDeleteUsuarioRepositoryMock).toHaveBeenCalledWith("staff-1");
  });
});
