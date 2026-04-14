import { prisma } from "@/lib/prisma"

type ListVisitantesRepositoryInput = {
  page: number
  limit: number
  createdFrom?: string
  createdTo?: string
}

function toStartOfDayUtc(dateIso: string) {
  return new Date(`${dateIso}T00:00:00.000Z`)
}

function toEndOfDayUtc(dateIso: string) {
  return new Date(`${dateIso}T23:59:59.999Z`)
}

export async function listVisitantesRepository(input: ListVisitantesRepositoryInput) {
  const skip = (input.page - 1) * input.limit
  const where = {
    type: "VISITOR" as const,
    visitorProfile: {
      isNot: null
    },
    createdAt:
      input.createdFrom || input.createdTo
        ? {
            gte: input.createdFrom ? toStartOfDayUtc(input.createdFrom) : undefined,
            lte: input.createdTo ? toEndOfDayUtc(input.createdTo) : undefined
          }
        : undefined
  }

  const [items, total] = await prisma.$transaction([
    prisma.member.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        phone: true,
        createdAt: true
      },
      skip,
      take: input.limit
    }),
    prisma.member.count({
      where
    })
  ])

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.ceil(total / input.limit)
  }
}
