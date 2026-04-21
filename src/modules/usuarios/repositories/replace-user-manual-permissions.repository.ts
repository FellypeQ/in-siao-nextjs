import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type RepositoryClient = PrismaClient | Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function replaceUserManualPermissionsRepository(
  userId: string,
  permissions: string[],
  db: RepositoryClient = prisma,
) {
  await db.userManualPermission.deleteMany({ where: { userId } });

  if (permissions.length > 0) {
    await db.userManualPermission.createMany({
      data: permissions.map((permission) => ({ userId, permission })),
    });
  }
}
