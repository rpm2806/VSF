import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    
    // Only MASTER_ADMIN can change the status
    if (userRole !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    const expense = await db.expense.update({
      where: { id },
      data: { status }
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: `EXPENSE_${status}`,
      entityType: "EXPENSE",
      entityId: expense.id,
      details: `Updated expense status to ${status}`
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("[EXPENSES_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
