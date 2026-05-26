import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { status } = await req.json()
    const { id } = await params

    if (!status) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    // Ensure they aren't deactivating themselves or another MASTER_ADMIN
    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) return new NextResponse("Not found", { status: 404 })
    if (targetUser.role === "MASTER_ADMIN") {
      return new NextResponse("Cannot modify MASTER_ADMIN", { status: 403 })
    }

    const user = await db.user.update({
      where: { id },
      data: { status }
    })

    await logActivity({
      userId: session.user.id,
      action: "VOLUNTEER_STATUS_CHANGED",
      entityType: "USER",
      entityId: user.id,
      details: `Changed volunteer status for ${user.email} to ${status}`
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USERS_ID_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
