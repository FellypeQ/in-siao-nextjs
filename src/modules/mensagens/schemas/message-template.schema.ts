import { z } from "zod"

const invalidReplacementCharMessage =
  "Texto contem caractere invalido (�). Cole novamente os emojis para corrigir a codificacao."

export const createMessageTemplateSchema = z.object({
  title: z
    .string()
    .min(1, "Título obrigatório")
    .max(100, "Título: máximo 100 caracteres")
    .refine((value) => !value.includes("\uFFFD"), invalidReplacementCharMessage),
  body: z
    .string()
    .min(1, "Corpo obrigatório")
    .max(4000, "Corpo: máximo 4000 caracteres")
    .refine((value) => !value.includes("\uFFFD"), invalidReplacementCharMessage),
})

export const updateMessageTemplateSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(100)
    .refine((value) => !value.includes("\uFFFD"), invalidReplacementCharMessage)
    .optional(),
  body: z
    .string()
    .min(1)
    .max(4000)
    .refine((value) => !value.includes("\uFFFD"), invalidReplacementCharMessage)
    .optional(),
  order: z.number().int().positive().optional(),
})

export const logMensagemVisitanteSchema = z.object({
  messageTemplateId: z.string().min(1, "Template obrigatório"),
})
