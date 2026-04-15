import { prisma } from "@/lib/prisma";

export async function replaceUserPermissionsRepository(
  userId: string,
  permissions: string[],
) {
  return prisma.$transaction(async (tx) => {
    await tx.userPermission.deleteMany({ where: { userId } });

    if (permissions.length > 0) {
      await tx.userPermission.createMany({
        data: permissions.map((permission) => ({ userId, permission })),
      });
    }
  });
}
