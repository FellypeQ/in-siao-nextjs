import { prisma } from "@/lib/prisma"

async function deleteOrphanPraysForMember(memberId: string, tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) {
  const memberPrays = await tx.memberPray.findMany({
    where: { memberId },
    select: { prayId: true }
  })

  const prayIds = memberPrays.map((r) => r.prayId)

  if (prayIds.length === 0) {
    return
  }

  const sharedPrays = await tx.memberPray.findMany({
    where: {
      prayId: { in: prayIds },
      memberId: { not: memberId }
    },
    select: { prayId: true }
  })

  const sharedPrayIds = new Set(sharedPrays.map((r) => r.prayId))
  const orphanedPrayIds = prayIds.filter((id) => !sharedPrayIds.has(id))

  if (orphanedPrayIds.length > 0) {
    await tx.pray.deleteMany({ where: { id: { in: orphanedPrayIds } } })
  }
}

export async function deleteVisitanteRepository(memberId: string) {
  await prisma.$transaction(async (tx) => {
    const principalRelationships = await tx.memberRelationship.findMany({
      where: { principalMemberId: memberId },
      select: { relatedMemberId: true }
    })

    const relatedMemberIds = Array.from(
      new Set(principalRelationships.map((relationship) => relationship.relatedMemberId))
    )

    for (const relatedMemberId of relatedMemberIds) {
      const relationshipCount = await tx.memberRelationship.count({
        where: {
          OR: [{ principalMemberId: relatedMemberId }, { relatedMemberId: relatedMemberId }]
        }
      })

      if (relationshipCount > 1) {
        continue
      }

      await tx.memberMessageLog.deleteMany({ where: { memberId: relatedMemberId } })
      await deleteOrphanPraysForMember(relatedMemberId, tx)
      await tx.member.delete({ where: { id: relatedMemberId } })
    }

    await tx.memberMessageLog.deleteMany({ where: { memberId } })

    await deleteOrphanPraysForMember(memberId, tx)

    await tx.member.delete({ where: { id: memberId } })
  })
}
