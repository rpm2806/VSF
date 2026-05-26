import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

// GET: fetch all soft-deleted items (Donations, Expenses, Announcements)
// Only items deleted within last 3 months
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN") return new NextResponse("Forbidden", { status: 403 })

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const [donations, expenses, announcements] = await Promise.all([
      db.donation.findMany({
        where: { deletedAt: { not: null, gte: threeMonthsAgo } },
        include: {
          student: { select: { fullName: true, federationId: true } },
          verifiedBy: { select: { name: true } }
        },
        orderBy: { deletedAt: "desc" }
      }),
      db.expense.findMany({
        where: { deletedAt: { not: null, gte: threeMonthsAgo } },
        orderBy: { deletedAt: "desc" }
      }),
      db.announcement.findMany({
        where: { deletedAt: { not: null, gte: threeMonthsAgo } },
        orderBy: { deletedAt: "desc" }
      }),
    ])

    return NextResponse.json({ donations, expenses, announcements })
  } catch (error) {
    console.error("[RECYCLE_BIN_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST: restore an item by type and id
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN") return new NextResponse("Forbidden", { status: 403 })

    const { type, id } = await req.json()
    if (!type || !id) return new NextResponse("Missing type or id", { status: 400 })

    if (type === "donation") {
      await db.donation.update({ where: { id }, data: { deletedAt: null } })
    } else if (type === "expense") {
      await db.expense.update({ where: { id }, data: { deletedAt: null } })
    } else if (type === "announcement") {
      await db.announcement.update({ where: { id }, data: { deletedAt: null } })
    } else {
      return new NextResponse("Invalid type", { status: 400 })
    }

    await logActivity({
      userId: session.user.id,
      action: "ITEM_RESTORED",
      entityType: type.toUpperCase(),
      entityId: id,
      details: `Restored ${type} from recycle bin`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RECYCLE_BIN_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// DELETE: permanently delete an item
export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN") return new NextResponse("Forbidden", { status: 403 })

    const { type, id } = await req.json()
    if (!type || !id) return new NextResponse("Missing type or id", { status: 400 })

    if (type === "donation") {
      await db.receipt.deleteMany({ where: { donationId: id } })
      await db.donation.delete({ where: { id } })
    } else if (type === "expense") {
      await db.expense.delete({ where: { id } })
    } else if (type === "announcement") {
      await db.announcement.delete({ where: { id } })
    } else {
      return new NextResponse("Invalid type", { status: 400 })
    }

    await logActivity({
      userId: session.user.id,
      action: "ITEM_PERMANENTLY_DELETED",
      entityType: type.toUpperCase(),
      entityId: id,
      details: `Permanently deleted ${type}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RECYCLE_BIN_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
