import { prisma } from "@/lib/prisma";

export async function findUserProfileAssignmentsRepository(userId: string) {
  return prisma.userProfileAssignment.findMany({
    where: { userId },
    include: { profile: true },
    orderBy: { profile: { nome: "asc" } },
  });
}
