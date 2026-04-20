import { prisma } from "@/lib/prisma"
import type { ExportVisitantesInput } from "@/modules/visitantes/schemas/export-visitantes.schema"

function toStartOfDayUtc(dateIso: string) {
  return new Date(`${dateIso}T00:00:00.000Z`)
}

function toEndOfDayUtc(dateIso: string) {
  return new Date(`${dateIso}T23:59:59.999Z`)
}

export async function listVisitantesForExportRepository(input: ExportVisitantesInput) {
  return prisma.member.findMany({
    where: {
      type: "VISITOR",
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
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      name: true,
      birthDate: true,
      phone: true,
      type: true,
      createdAt: true,
      visitorProfile: {
        select: {
          actualChurch: true,
          howKnow: true
        }
      },
      memberPrays: {
        include: {
          pray: {
            select: {
              id: true,
              text: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      principalRelations: {
        select: {
          relationshipType: true,
          relatedMember: {
            select: {
              name: true,
              birthDate: true,
              phone: true,
              type: true,
              createdAt: true
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
