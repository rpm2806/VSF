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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    // Find the target user
    const targetUser = await db.user.findUnique({ where: { id } })
    if (!targetUser) return new NextResponse("Not found", { status: 404 })
    
    // Safety check: Cannot delete a MASTER_ADMIN
    if (targetUser.role === "MASTER_ADMIN") {
      return new NextResponse("Cannot delete MASTER_ADMIN accounts", { status: 403 })
    }

    // Cascading relationship updates to prevent foreign key errors
    await db.auditLog.updateMany({
      where: { userId: id },
      data: { userId: null }
    })

    await db.donation.updateMany({
      where: { verifiedById: id },
      data: { verifiedById: null }
    })

    // Delete the user record
    await db.user.delete({ where: { id } })

    // Log this deletion activity
    await logActivity({
      userId: session.user.id,
      action: "VOLUNTEER_DELETED",
      entityType: "USER",
      entityId: id,
      details: `Deleted volunteer account: ${targetUser.name} (${targetUser.email})`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USERS_ID_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
