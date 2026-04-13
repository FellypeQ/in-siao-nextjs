import { createCipheriv, createHash, randomBytes } from "node:crypto"

function buildEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET ?? "dev-in-siao-auth-secret-change-this"

  return createHash("sha256").update(secret).digest()
}

export function encryptSurname(value: string): string {
  const key = buildEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`
}
