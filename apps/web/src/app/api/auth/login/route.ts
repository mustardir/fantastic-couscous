import { prisma } from "@fortress/db"
import { getSession } from "@/lib/session"
import { z } from "zod"
import bcrypt from "bcryptjs"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return Response.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      return Response.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const session = await getSession()
    session.userId = user.id
    session.email = user.email
    session.role = user.role
    await session.save()

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        meta: { email: user.email },
      },
    })

    return Response.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}
