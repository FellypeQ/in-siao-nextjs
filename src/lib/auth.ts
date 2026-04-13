import type { NextRequest, NextResponse } from "next/server"

export const SESSION_COOKIE_NAME = "in_siao_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 6

type SessionRole = "ADMIN"

export type SessionPayload = {
  sub: string
  nome: string
  email: string
  role: SessionRole
  iat: number
  exp: number
}

type SessionUser = {
  id: string
  nome: string
  email: string
  role: SessionRole
}

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-in-siao-auth-secret-change-this"
}

function toBase64Url(data: Uint8Array): string {
  let text = ""

  for (const byte of data) {
    text += String.fromCharCode(byte)
  }

  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function fromBase64Url(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const decoded = atob(base64 + padding)
  const bytes = new Uint8Array(decoded.length)

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index)
  }

  return bytes
}

async function signValue(value: string): Promise<string> {
  const secret = getAuthSecret()
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value))

  return toBase64Url(new Uint8Array(signature))
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS
  }

  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))
  const payloadBase64 = toBase64Url(payloadBytes)
  const signature = await signValue(payloadBase64)

  return `${payloadBase64}.${signature}`
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const [payloadBase64, signature] = token.split(".")

  if (!payloadBase64 || !signature) {
    return null
  }

  const expectedSignature = await signValue(payloadBase64)

  if (signature !== expectedSignature) {
    return null
  }

  try {
    const payloadBytes = fromBase64Url(payloadBase64)
    const payloadText = new TextDecoder().decode(payloadBytes)
    const payload = JSON.parse(payloadText) as SessionPayload

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/"
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  })
}
