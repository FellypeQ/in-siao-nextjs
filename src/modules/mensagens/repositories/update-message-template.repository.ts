import { prisma } from "@/lib/prisma"

export async function findMessageTemplateByIdRepository(id: string) {
  return prisma.messageTemplate.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function updateMessageTemplateRepository(
  id: string,
  data: { title?: string; body?: string; order?: number }
) {
  return prisma.messageTemplate.update({ where: { id }, data })
}
