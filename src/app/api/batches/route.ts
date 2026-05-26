import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "MASTER_ADMIN" && session.user.role !== "VOLUNTEER")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { oldName, newName } = await req.json()

    if (!oldName || !newName) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    // Rename batch across all students
    const result = await db.student.updateMany({
      where: { batch: oldName },
      data: { batch: newName }
    })

    await logActivity({
      userId: session.user.id,
      action: "BATCH_RENAMED",
      entityType: "BATCH",
      entityId: oldName,
      details: `Renamed batch from "${oldName}" to "${newName}" for ${result.count} students`
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("[BATCHES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
