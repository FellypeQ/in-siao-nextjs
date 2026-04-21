import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type RepositoryClient = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function recomputeUserPermissionsRepository(
  userId: string,
  db: RepositoryClient = prisma,
) {
  const [manualRows, assignments] = await Promise.all([
    db.userManualPermission.findMany({ where: { userId }, select: { permission: true } }),
    db.userProfileAssignment.findMany({
      where: { userId },
      include: { profile: { select: { permissions: true } } },
    }),
  ]);

  const manual = manualRows.map((r) => r.permission);
  const fromProfiles = assignments.flatMap((a) => a.profile.permissions);
  const effective = [...new Set([...manual, ...fromProfiles])];

  await db.userPermission.deleteMany({ where: { userId } });

  if (effective.length > 0) {
    await db.userPermission.createMany({
      data: effective.map((permission) => ({ userId, permission })),
    });
  }
}
