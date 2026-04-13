import { z } from "zod"

export const listVisitantesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
})

export type ListVisitantesInput = z.infer<typeof listVisitantesSchema>
