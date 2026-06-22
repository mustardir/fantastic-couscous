import { getSession } from "@/lib/session"

export async function POST() {
  try {
    const session = await getSession()
    session.destroy()

    return Response.json({
      success: true,
      data: { message: "Logged out successfully" },
    })
  } catch (error) {
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}
