import { prisma } from "@/lib/prisma";

export async function listPerfisRepository() {
  return prisma.userProfile.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { assignments: true } },
    },
  });
}
