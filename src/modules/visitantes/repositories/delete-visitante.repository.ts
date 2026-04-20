import { prisma } from "@/lib/prisma"

export async function deleteVisitanteRepository(memberId: string) {
  await prisma.$transaction(async (tx) => {
    const memberPrays = await tx.memberPray.findMany({
      where: { memberId },
      select: { prayId: true }
    })

    const prayIds = memberPrays.map((r) => r.prayId)

    if (prayIds.length > 0) {
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

    await tx.member.delete({ where: { id: memberId } })
  })
}
