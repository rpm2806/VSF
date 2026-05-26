import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { uploadBase64 } from "@/lib/cloudinary"

// POST — public submission (no auth required, anyone can submit)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fullName, email, mobileNumber, studentId, supportType, description, attachmentUrl, attachmentName } = body

    if (!fullName || !email || !mobileNumber || !supportType || !description) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    let finalAttachmentUrl = attachmentUrl || null
    if (attachmentUrl && attachmentUrl.startsWith("data:")) {
      try {
        finalAttachmentUrl = await uploadBase64(attachmentUrl, "vriksh_queries")
      } catch (err) {
        console.error("Failed to upload support attachment to Cloudinary:", err)
      }
    }

    const request = await db.supportRequest.create({
      data: {
        fullName,
        email,
        mobileNumber,
        studentId: studentId || null,
        supportType,
        description,
        attachmentUrl: finalAttachmentUrl,
        attachmentName: attachmentName || null,
        status: "PENDING",
      }
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error("[SUPPORT_REQUEST_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// GET — only MASTER_ADMIN
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const requests = await db.supportRequest.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("[SUPPORT_REQUEST_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
