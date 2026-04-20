import { prisma } from "@/lib/prisma"

export async function getVisitanteMensagensRepository(memberId: string) {
  const [templates, logs] = await Promise.all([
    prisma.messageTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, title: true, body: true, order: true },
    }),
    prisma.memberMessageLog.findMany({
      where: { memberId },
      orderBy: { sentAt: "asc" },
      select: {
        id: true,
        messageTemplateId: true,
        messageTitle: true,
        sentAt: true,
      },
    }),
  ])

  return { templates, logs }
}
