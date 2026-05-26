import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN" && userRole !== "VOLUNTEER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, amount, category, description, billImage } = body

    const expense = await db.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        description,
        billImage,
        status: userRole === "MASTER_ADMIN" ? "APPROVED" : "PENDING",
      }
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "EXPENSE_RECORDED",
      entityType: "EXPENSE",
      entityId: expense.id,
      details: `Recorded new expense: ${title} for ₹${amount}`
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("[EXPENSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
