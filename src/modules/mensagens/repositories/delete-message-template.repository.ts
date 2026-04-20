import { prisma } from "@/lib/prisma"

export async function countLogsForTemplateRepository(templateId: string): Promise<number> {
  return prisma.memberMessageLog.count({
    where: { messageTemplateId: templateId },
  })
}

export async function softDeleteMessageTemplateRepository(id: string) {
  return prisma.messageTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function hardDeleteMessageTemplateRepository(id: string) {
  return prisma.messageTemplate.delete({ where: { id } })
}
