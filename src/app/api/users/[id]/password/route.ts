import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import bcryptjs from "bcryptjs"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { newPassword } = await req.json()
    const { id } = await params

    if (!newPassword || newPassword.length < 6) {
      return new NextResponse("Password must be at least 6 characters", { status: 400 })
    }

    // Ensure they aren't changing MASTER_ADMIN
    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) return new NextResponse("Not found", { status: 404 })
    if (targetUser.role === "MASTER_ADMIN") {
      return new NextResponse("Cannot modify MASTER_ADMIN", { status: 403 })
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10)

    const user = await db.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    await logActivity({
      userId: session.user.id,
      action: "VOLUNTEER_PASSWORD_RESET",
      entityType: "USER",
      entityId: user.id,
      details: `Reset password for volunteer ${user.email}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USERS_PASSWORD_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
