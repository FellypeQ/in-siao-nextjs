import { prisma } from "@/lib/prisma"

export async function updateUserPasswordRepository(userId: string, passwordHash: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  })
}
