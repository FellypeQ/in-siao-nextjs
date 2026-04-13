import { prisma } from "@/lib/prisma"

export async function findVisitanteByIdRepository(memberId: string) {
  return prisma.member.findFirst({
    where: {
      id: memberId,
      type: "VISITOR",
      visitorProfile: {
        isNot: null
      }
    },
    include: {
      visitorProfile: true,
      memberPrays: {
        include: {
          pray: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      principalRelations: {
        include: {
          relatedMember: {
            select: {
              id: true,
              name: true,
              birthDate: true,
              phone: true,
              type: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  })
}
