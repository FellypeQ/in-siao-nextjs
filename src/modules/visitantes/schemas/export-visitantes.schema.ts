import { z } from "zod"

export const exportVisitantesSchema = z
  .object({
    createdFrom: z.iso.date().optional(),
    createdTo: z.iso.date().optional()
  })
  .superRefine((data, ctx) => {
    if (data.createdFrom && data.createdTo && data.createdFrom > data.createdTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["createdTo"],
        message: "createdTo deve ser maior ou igual a createdFrom"
      })
    }
  })

export type ExportVisitantesInput = z.infer<typeof exportVisitantesSchema>
