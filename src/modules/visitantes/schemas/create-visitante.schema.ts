import { z } from "zod"

import type { CreateVisitanteInput } from "@/modules/visitantes/types/visitante.type"

const actualChurchValues = ["NONE", "EVANGELICAL", "CATHOLIC", "OTHER", "NO_REPORT"] as const
const howKnowValues = [
  "FRIEND_OR_FAMILY_REFERRAL",
  "SOCIAL_MEDIA",
  "WALK_IN",
  "EVENT",
  "GOOGLE_SEARCH",
  "OTHER"
] as const
const relationshipTypeValues = [
  "SPOUSE",
  "CHILD",
  "FATHER",
  "MOTHER",
  "SIBLING",
  "GRANDPARENT",
  "GRANDCHILD",
  "UNCLE_AUNT",
  "COUSIN",
  "OTHER"
] as const

const familyMemberSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres"),
  birthDate: z.coerce.date(),
  phone: z.string().trim().optional(),
  relationshipType: z.enum(relationshipTypeValues)
})

export const createVisitanteSchema = z
  .object({
    name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres"),
    birthDate: z.coerce.date().max(new Date(), "Data de nascimento nao pode ser futura"),
    document: z.string().trim().min(3).optional(),
    phone: z.string().trim().optional(),
    baptized: z.boolean(),
    actualChurch: z.enum(actualChurchValues),
    howKnow: z.enum(howKnowValues),
    howKnowOtherAnswer: z.string().trim().optional(),
    prayText: z.string().trim().max(1000).optional(),
    familyMembers: z.array(familyMemberSchema).default([])
  })
  .superRefine((data, ctx) => {
    if (data.howKnow === "OTHER" && !data.howKnowOtherAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["howKnowOtherAnswer"],
        message: "Campo obrigatorio quando Como conheceu for Outra"
      })
    }
  }) satisfies z.ZodType<CreateVisitanteInput>

export type CreateVisitanteSchemaInput = z.input<typeof createVisitanteSchema>
export type CreateVisitanteSchemaOutput = z.output<typeof createVisitanteSchema>
