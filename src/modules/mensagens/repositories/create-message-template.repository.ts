import { prisma } from "@/lib/prisma"

export async function getMaxOrderRepository(): Promise<number> {
  const result = await prisma.messageTemplate.aggregate({
    _max: { order: true },
    where: { deletedAt: null },
  })
  return result._max.order ?? 0
}

export async function createMessageTemplateRepository(data: {
  title: string
  body: string
  order: number
}) {
  return prisma.messageTemplate.create({ data })
}
