import { prisma } from "@/lib/prisma";

export async function countActiveAdminsRepository() {
  return prisma.user.count({
    where: {
      role: { in: ["ADMIN", "MASTER"] },
      deletedAt: null,
    },
  });
}
