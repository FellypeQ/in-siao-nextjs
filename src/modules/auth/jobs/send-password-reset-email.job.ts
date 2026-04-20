import { Resend } from "resend"

import { renderPasswordResetEmail } from "@/mailer/templates/password-reset"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmailJob(email: string, token: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const resetLink = `${appUrl}/redefinir-senha?token=${token}`
  const fromEmail = process.env.FROM_EMAIL ?? "no_reply@siao.com.br"

  const html = await renderPasswordResetEmail(resetLink, appUrl)

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Recuperação de Senha — Sião Digital",
    html
  })
}
