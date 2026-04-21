import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type RepositoryClient = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function replaceUserProfileAssignmentsRepository(
  userId: string,
  profileIds: string[],
  db: RepositoryClient = prisma,
) {
  await db.userProfileAssignment.deleteMany({ where: { userId } });

  if (profileIds.length > 0) {
    await db.userProfileAssignment.createMany({
      data: profileIds.map((profileId) => ({ userId, profileId })),
    });
  }
}
