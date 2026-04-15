import { prisma } from "@/lib/prisma";

export async function findUserPermissionsByUserIdRepository(userId: string) {
  const permissions = await prisma.userPermission.findMany({
    where: { userId },
    select: { permission: true },
    orderBy: { permission: "asc" },
  });

  return permissions.map((item) => item.permission);
}
