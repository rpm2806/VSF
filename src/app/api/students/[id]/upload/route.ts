import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { uploadBuffer } from "@/lib/cloudinary"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params
    const studentId = resolvedParams.id

    const existingStudent = await db.student.findUnique({ where: { id: studentId } })
    if (!existingStudent) {
      return new NextResponse("Student not found", { status: 404 })
    }

    const formData = await req.formData()

    // Extract files
    const profileImageFile = formData.get("profileImage") as File | null
    const idProofImageFile = formData.get("idProofImage") as File | null

    const saveFileToCloudinary = async (file: File | null, folder: string) => {
      if (!file || typeof file === "string" || file.size === 0) return null
      if (file.size > 4 * 1024 * 1024) {
        throw new Error("File size must be under 4MB.")
      }
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      return await uploadBuffer(buffer, folder)
    }

    const profileImage = await saveFileToCloudinary(profileImageFile, "vriksh_students")
    const idProofImage = await saveFileToCloudinary(idProofImageFile, "vriksh_ids")

    // Only update fields that have files provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (profileImage) updateData.profileImage = profileImage
    if (idProofImage) updateData.idProofImage = idProofImage

    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No files provided", { status: 400 })
    }

    const student = await db.student.update({
      where: { id: studentId },
      data: updateData,
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "STUDENT_UPDATED",
      entityType: "STUDENT",
      entityId: student.id,
      details: `Admin updated images for student: ${student.federationId}`,
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error("[STUDENT_UPLOAD]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
