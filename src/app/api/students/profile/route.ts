import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "STUDENT" && session.user.role !== "ALUMNI" && session.user.role !== "OTHER")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const studentId = session.user.id
    if (!studentId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    const body = await req.json()
    const { 
      mobileNumber,
      email,
      fatherName,
      motherName,
      parentContact,
      permanentAddress,
      currentAddress,
      lastSchool,
      specialization,
      bio,
      workingAt,
      bloodGroup
    } = body

    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: {
        mobileNumber,
        email: email ? email.toUpperCase() : null,
        fatherName: fatherName ? fatherName.toUpperCase() : null,
        motherName: motherName ? motherName.toUpperCase() : null,
        parentContact,
        permanentAddress: permanentAddress ? permanentAddress.toUpperCase() : null,
        currentAddress: currentAddress ? currentAddress.toUpperCase() : null,
        lastSchool: lastSchool ? lastSchool.toUpperCase() : null,
        specialization: specialization ? specialization.toUpperCase() : null,
        bio: bio ? bio.toUpperCase() : null,
        workingAt: workingAt ? workingAt.toUpperCase() : null,
        bloodGroup: bloodGroup ? bloodGroup.toUpperCase() : null
      }
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "PROFILE_UPDATED",
      entityType: "STUDENT",
      entityId: studentId,
      details: "Student updated their profile settings"
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("[STUDENT_PROFILE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
