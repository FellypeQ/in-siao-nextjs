import { z } from "zod"

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Email inválido")
})

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>
