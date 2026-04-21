import { prisma } from "@/lib/prisma";

export async function findUsersByProfileRepository(profileId: string): Promise<string[]> {
  const assignments = await prisma.userProfileAssignment.findMany({
    where: { profileId },
    select: { userId: true },
  });

  return assignments.map((a) => a.userId);
}
