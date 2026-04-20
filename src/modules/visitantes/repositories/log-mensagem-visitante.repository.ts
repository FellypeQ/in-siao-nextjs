import { prisma } from "@/lib/prisma"

export async function createMemberMessageLogRepository(data: {
  memberId: string
  messageTemplateId: string
  messageTitle: string
  messageBody: string
  sentByUserId: string
}) {
  return prisma.memberMessageLog.create({ data })
}
