import { prisma } from "@/lib/prisma"

export async function listMessageTemplatesRepository() {
  return prisma.messageTemplate.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  })
}
