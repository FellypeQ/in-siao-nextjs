import { z } from "zod";

import type { UpdateVisitanteInput } from "@/modules/visitantes/types/visitante.type";

const actualChurchValues = [
  "NONE",
  "EVANGELICAL",
  "CATHOLIC",
  "OTHER",
  "NO_REPORT",
] as const;
const howKnowValues = [
  "FRIEND_OR_FAMILY_REFERRAL",
  "SOCIAL_MEDIA",
  "WALK_IN",
  "EVENT",
  "GOOGLE_SEARCH",
  "OTHER",
] as const;
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
  "OTHER",
] as const;

const familyPayloadSchema = z.object({
  name: z.string().trim().min(2),
  birthDate: z.coerce.date(),
  phone: z.string().trim().optional(),
  relationshipType: z.enum(relationshipTypeValues),
});

const createOperationSchema = z.object({
  action: z.literal("create"),
  payload: familyPayloadSchema,
});

const updateOperationSchema = z.object({
  action: z.literal("update"),
  relationshipId: z.string().trim().min(1),
  memberId: z.string().trim().min(1),
  payload: familyPayloadSchema,
});

const unlinkOperationSchema = z.object({
  action: z.literal("unlink"),
  relationshipId: z.string().trim().min(1),
});

const deleteOperationSchema = z.object({
  action: z.literal("delete"),
  relationshipId: z.string().trim().min(1),
  memberId: z.string().trim().min(1),
});

export const updateVisitanteSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(2),
    birthDate: z.coerce
      .date()
      .max(new Date(), "Data de nascimento nao pode ser futura"),
    document: z.string().trim().min(3).optional(),
    phone: z.string().trim().optional(),
    actualChurch: z.enum(actualChurchValues),
    howKnow: z.enum(howKnowValues),
    howKnowOtherAnswer: z.string().trim().optional(),
    prayText: z.string().trim().max(1000).optional(),
    familyOperations: z
      .array(
        z.discriminatedUnion("action", [
          createOperationSchema,
          updateOperationSchema,
          unlinkOperationSchema,
          deleteOperationSchema,
        ]),
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.howKnow === "OTHER" && !data.howKnowOtherAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["howKnowOtherAnswer"],
        message: "Campo obrigatorio quando Como conheceu for Outra",
      });
    }
  }) satisfies z.ZodType<UpdateVisitanteInput>;

export type UpdateVisitanteSchemaInput = z.input<typeof updateVisitanteSchema>;
export type UpdateVisitanteSchemaOutput = z.output<
  typeof updateVisitanteSchema
>;
