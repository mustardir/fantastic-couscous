import { prisma } from "@fortress/db"
import { requireAuth } from "@/lib/session"

export async function GET() {
  try {
    const session = await requireAuth()

    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phone: true,
            address: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: user,
    })
  } catch (error) {
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}
