import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text
} from "@react-email/components"
import { render } from "@react-email/render"

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
const PREVIEW_URL = `${appUrl}/redefinir-senha?token=preview-token`

type PasswordResetEmailProps = {
  resetLink?: string
  appUrl?: string
}

export default function PasswordResetEmail({
  resetLink = PREVIEW_URL,
  appUrl
}: PasswordResetEmailProps) {

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Recuperação de Senha — Sião Digital</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── Logo ── */}
          <Section style={styles.logoSection}>
            <Img
              src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/logo-siao-sem-fundo.png`}
              width="88"
              height="88"
              alt="Sião Igreja Batista"
              style={styles.logo}
            />
          </Section>

          {/* ── Ícone de reset ── */}
          <Section style={styles.iconSection}>
            {/* Círculo externo cinza */}
            <table width="72" cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
              <tbody>
                <tr>
                  <td
                    width="72"
                    height="72"
                    align="center"
                    valign="middle"
                    style={styles.iconCircle}
                  >
                    {/* SVG: cadeado inline — compatível com clientes de email modernos */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                        fill="#FF6D00"
                      />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ── Título ── */}
          <Section style={styles.titleSection}>
            <Text style={styles.title}>Recuperação de Senha</Text>
          </Section>

          {/* ── Corpo ── */}
          <Section style={styles.bodySection}>
            <Text style={styles.bodyText}>
              Olá, recebemos uma solicitação para redefinir a sua senha no portal{" "}
              <Link href={appUrl} style={styles.brandLink}>
                Sião Digital
              </Link>
              . Clique no botão abaixo para prosseguir com a alteração.
            </Text>
          </Section>

          {/* ── Botão ── */}
          <Section style={styles.buttonSection}>
            <Button href={resetLink} style={styles.button}>
              REDEFINIR SENHA
            </Button>
          </Section>

          {/* ── Link alternativo ── */}
          <Section style={styles.altSection}>
            <Text style={styles.altLabel}>LINK ALTERNATIVO</Text>
            <Text style={styles.altDesc}>
              Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
            </Text>

            {/* Caixa com borda laranja à esquerda */}
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={styles.altLinkBox}>
                    <Link href={resetLink} style={styles.altLink}>
                      {resetLink}
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ── Aviso de segurança ── */}
          <Section style={styles.disclaimerSection}>
            <Text style={styles.disclaimer}>
              Se você não solicitou esta alteração, por favor ignore este e-mail por motivos de
              segurança.
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* ── Ícones do rodapé ── */}
          <Section style={styles.footerIconSection}>
            <table width="80" cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
              <tbody>
                <tr>
                  <td align="center" width="24" style={{ paddingRight: "8px" }}>
                    <span style={styles.footerIcon}>?</span>
                  </td>
                  <td align="center" width="24" style={{ paddingRight: "8px" }}>
                    <span style={styles.footerIcon}>⊕</span>
                  </td>
                  <td align="center" width="24">
                    <span style={styles.footerIcon}>✉</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ── Copyright ── */}
          <Section style={styles.copyrightSection}>
            <Text style={styles.copyrightText}>
              © 2026 Igreja Batista Sião. Todos os direitos reservados.
            </Text>
            <Text style={styles.copyrightText}>
              Este é um e-mail automático, por favor não responda.
            </Text>

            <Text style={styles.footerLinks}>
              <Link href={appUrl} style={styles.footerLink}>
                Suporte
              </Link>
              {"  ·  "}
              <Link href={appUrl} style={styles.footerLink}>
                Privacidade
              </Link>
              {"  ·  "}
              <Link href={appUrl} style={styles.footerLink}>
                Termos de Uso
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ── Estilos ────────────────────────────────────────────────────────────────

const orange = "#FF6D00"
const orangeLight = "#FFF3EC"
const gray100 = "#F5F5F5"
const gray300 = "#E0E0E0"
const gray500 = "#9E9E9E"
const gray700 = "#555555"
const textPrimary = "#1A1A1A"

const styles = {
  body: {
    backgroundColor: "#F0F0F0",
    fontFamily: "Arial, Helvetica, sans-serif",
    margin: 0,
    padding: 0
  } as React.CSSProperties,

  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    margin: "30px auto",
    maxWidth: "600px",
    overflow: "hidden"
  } as React.CSSProperties,

  logoSection: {
    paddingTop: "36px",
    paddingBottom: "20px",
    textAlign: "center" as const
  },

  logo: {
    display: "block",
    margin: "0 auto"
  } as React.CSSProperties,

  iconSection: {
    paddingBottom: "20px",
    textAlign: "center" as const
  },

  iconCircle: {
    backgroundColor: gray100,
    borderRadius: "50%",
    border: `1px solid ${gray300}`
  } as React.CSSProperties,

  titleSection: {
    paddingLeft: "40px",
    paddingRight: "40px",
    paddingBottom: "8px",
    textAlign: "center" as const
  },

  title: {
    color: textPrimary,
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    margin: "0"
  } as React.CSSProperties,

  bodySection: {
    paddingLeft: "60px",
    paddingRight: "60px",
    paddingBottom: "32px"
  },

  bodyText: {
    color: gray700,
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0",
    textAlign: "center" as const
  },

  brandLink: {
    color: orange,
    fontWeight: 700,
    textDecoration: "none"
  } as React.CSSProperties,

  buttonSection: {
    paddingBottom: "48px",
    textAlign: "center" as const
  },

  button: {
    backgroundColor: orange,
    borderRadius: "4px",
    color: "#FFFFFF",
    display: "inline-block",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "14px 36px",
    textDecoration: "none",
    textTransform: "uppercase" as const
  } as React.CSSProperties,

  altSection: {
    paddingLeft: "40px",
    paddingRight: "40px",
    paddingBottom: "8px"
  },

  altLabel: {
    color: gray500,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    margin: "0 0 8px",
    textAlign: "center" as const,
    textTransform: "uppercase" as const
  } as React.CSSProperties,

  altDesc: {
    color: gray700,
    fontSize: "13px",
    margin: "0 0 12px",
    textAlign: "center" as const
  } as React.CSSProperties,

  altLinkBox: {
    backgroundColor: orangeLight,
    borderLeft: `3px solid ${orange}`,
    borderRadius: "4px",
    padding: "12px 16px"
  } as React.CSSProperties,

  altLink: {
    color: orange,
    fontSize: "12px",
    textDecoration: "none",
    wordBreak: "break-all" as const
  } as React.CSSProperties,

  disclaimerSection: {
    paddingLeft: "60px",
    paddingRight: "60px",
    paddingTop: "16px",
    paddingBottom: "28px"
  },

  disclaimer: {
    color: "#C0C0C0",
    fontSize: "12px",
    fontStyle: "italic",
    margin: "0",
    textAlign: "center" as const
  } as React.CSSProperties,

  hr: {
    borderColor: "#EEEEEE",
    borderStyle: "solid",
    borderWidth: "1px 0 0",
    margin: "0 40px"
  } as React.CSSProperties,

  footerIconSection: {
    paddingTop: "20px",
    paddingBottom: "12px",
    textAlign: "center" as const
  },

  footerIcon: {
    color: "#BBBBBB",
    fontSize: "16px"
  } as React.CSSProperties,

  copyrightSection: {
    paddingLeft: "40px",
    paddingRight: "40px",
    paddingBottom: "28px",
    textAlign: "center" as const
  },

  copyrightText: {
    color: "#BBBBBB",
    fontSize: "12px",
    margin: "0 0 4px"
  } as React.CSSProperties,

  footerLinks: {
    color: gray500,
    fontSize: "11px",
    marginTop: "12px"
  } as React.CSSProperties,

  footerLink: {
    color: "#AAAAAA",
    textDecoration: "none"
  } as React.CSSProperties
}

// ── Utilitário de render ─────────────────────────────────────────────────────

export async function renderPasswordResetEmail(resetLink: string, appUrl: string): Promise<string> {
  return render(<PasswordResetEmail resetLink={resetLink} appUrl={appUrl} />)
}
