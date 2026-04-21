import { prisma } from "@/lib/prisma";

export async function findUserManualPermissionsRepository(userId: string): Promise<string[]> {
  const rows = await prisma.userManualPermission.findMany({
    where: { userId },
    select: { permission: true },
  });

  return rows.map((r) => r.permission);
}
