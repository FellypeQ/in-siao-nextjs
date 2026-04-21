import { beforeEach, describe, expect, it, vi } from "vitest";

import { createVisitanteService } from "@/modules/visitantes/services/create-visitante.service";

const createMemberRepositoryMock = vi.fn();
const createMemberVisitorRepositoryMock = vi.fn();
const createPrayRepositoryMock = vi.fn();
const createMemberPrayRepositoryMock = vi.fn();
const createMemberRelationshipRepositoryMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: async (callback: (tx: object) => unknown) => callback({}),
  },
}));

vi.mock("@/modules/visitantes/repositories/create-member.repository", () => ({
  createMemberRepository: (...args: unknown[]) =>
    createMemberRepositoryMock(...args),
}));

vi.mock(
  "@/modules/visitantes/repositories/create-member-visitor.repository",
  () => ({
    createMemberVisitorRepository: (...args: unknown[]) =>
      createMemberVisitorRepositoryMock(...args),
  }),
);

vi.mock("@/modules/visitantes/repositories/create-pray.repository", () => ({
  createPrayRepository: (...args: unknown[]) =>
    createPrayRepositoryMock(...args),
}));

vi.mock(
  "@/modules/visitantes/repositories/create-member-pray.repository",
  () => ({
    createMemberPrayRepository: (...args: unknown[]) =>
      createMemberPrayRepositoryMock(...args),
  }),
);

vi.mock(
  "@/modules/visitantes/repositories/create-member-relationship.repository",
  () => ({
    createMemberRelationshipRepository: (...args: unknown[]) =>
      createMemberRelationshipRepositoryMock(...args),
  }),
);

describe("createVisitanteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria visitante principal e familiares", async () => {
    createMemberRepositoryMock
      .mockResolvedValueOnce({ id: "member-principal" })
      .mockResolvedValueOnce({ id: "member-family" });
    createMemberVisitorRepositoryMock.mockResolvedValueOnce({
      id: "visitor-profile",
    });
    createPrayRepositoryMock.mockResolvedValueOnce({ id: "pray-1" });
    createMemberPrayRepositoryMock.mockResolvedValueOnce({
      memberId: "member-principal",
      prayId: "pray-1",
    });
    createMemberRelationshipRepositoryMock.mockResolvedValueOnce({
      id: "rel-1",
    });

    const result = await createVisitanteService({
      name: "Visitante",
      birthDate: new Date("1990-01-01"),
      actualChurch: "NONE",
      howKnow: "EVENT",
      prayText: "Orar por saude",
      familyMembers: [
        {
          name: "Filho",
          birthDate: new Date("2010-01-01"),
          relationshipType: "CHILD",
        },
      ],
    });

    expect(createMemberRepositoryMock).toHaveBeenCalledTimes(2);
    expect(createMemberVisitorRepositoryMock).toHaveBeenCalledTimes(1);
    expect(createMemberPrayRepositoryMock).toHaveBeenCalledTimes(1);
    expect(createMemberRelationshipRepositoryMock).toHaveBeenCalledTimes(1);
    expect(createMemberRepositoryMock).toHaveBeenCalledWith(
      expect.objectContaining({ baptized: false }),
      {},
    );
    expect(result.id).toBe("member-principal");
  });
});
