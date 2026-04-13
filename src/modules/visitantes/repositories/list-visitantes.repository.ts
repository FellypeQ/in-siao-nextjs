import { prisma } from "@/lib/prisma"

type ListVisitantesRepositoryInput = {
  page: number
  limit: number
}

export async function listVisitantesRepository(input: ListVisitantesRepositoryInput) {
  const skip = (input.page - 1) * input.limit

  const [items, total] = await prisma.$transaction([
    prisma.member.findMany({
      where: {
        type: "VISITOR",
        visitorProfile: {
          isNot: null
        }
      },
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
      where: {
        type: "VISITOR",
        visitorProfile: {
          isNot: null
        }
      }
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
