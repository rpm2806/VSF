import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const announcement = await db.announcement.create({
      data: { title, content, targetRole: "ALL" }
    })

    await logActivity({
      userId: session.user.id,
      action: "ANNOUNCEMENT_CREATED",
      entityType: "ANNOUNCEMENT",
      entityId: announcement.id,
      details: `Broadcasted announcement: ${title}`
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role
    if (userRole !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return new NextResponse("Missing ID", { status: 400 })

    const announcement = await db.announcement.delete({ where: { id } })

    await logActivity({
      userId: session.user.id,
      action: "ANNOUNCEMENT_DELETED",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      details: `Deleted announcement: ${announcement.title}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ANNOUNCEMENTS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
