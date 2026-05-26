import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, adminNote } = body

    const updated = await db.supportRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[SUPPORT_REQUEST_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
