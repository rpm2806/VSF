import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { uploadBuffer } from "@/lib/cloudinary"

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

    const formData = await req.formData()
    const title = formData.get("title") as string
    const amount = formData.get("amount") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const billImageFile = formData.get("billImage") as File | null

    // Upload bill image to Cloudinary if provided
    let billImage: string | null = null
    if (billImageFile && typeof billImageFile !== "string" && billImageFile.size > 0) {
      if (billImageFile.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: "Bill image must be under 4MB." }, { status: 400 })
      }
      const bytes = await billImageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      billImage = await uploadBuffer(buffer, "vriksh_bills")
    }

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
      details: `Recorded new expense: ${title} for ₹${amount}${billImage ? " (with bill)" : ""}`
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("[EXPENSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
