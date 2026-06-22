import { getIronSession, SessionOptions } from "iron-session"
import { cookies } from "next/headers"

export interface SessionData {
  userId: string
  email: string
  role: "USER" | "ADMIN"
}

export const sessionOptions: SessionOptions = {
  cookieName: "fortress-session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.userId) return null
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.userId || session.role !== "ADMIN") return null
  return session
}
