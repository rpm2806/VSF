import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json()
    const { 
      fullName, 
      mobileNumber, 
      joiningYear, 
      email, 
      batch, 
      class: studentClass,
      bloodGroup,
      aadhaarNumber,
      dob,
      duesAmount,
      donationStartDate,
      lastSchool,
      specialization,
      permanentAddress,
      currentAddress,
      bio,
      workingAt,
      fatherName,
      motherName,
      parentContact,
      status,
      role
    } = body

    // Only update fields that are explicitly provided in the payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (fullName !== undefined) updateData.fullName = fullName
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber
    if (email !== undefined) updateData.email = email || null
    if (batch !== undefined) updateData.batch = batch || null
    if (studentClass !== undefined) updateData.class = studentClass || null
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup || null
    if (aadhaarNumber !== undefined) updateData.aadhaarNumber = aadhaarNumber || null
    if (dob !== undefined) updateData.dob = dob || null
    if (duesAmount !== undefined) updateData.duesAmount = duesAmount ? parseFloat(duesAmount.toString()) : 0
    if (donationStartDate !== undefined) updateData.donationStartDate = donationStartDate ? new Date(donationStartDate) : null
    if (lastSchool !== undefined) updateData.lastSchool = lastSchool || null
    if (specialization !== undefined) updateData.specialization = specialization || null
    if (permanentAddress !== undefined) updateData.permanentAddress = permanentAddress || null
    if (currentAddress !== undefined) updateData.currentAddress = currentAddress || null
    if (bio !== undefined) updateData.bio = bio || null
    if (workingAt !== undefined) updateData.workingAt = workingAt || null
    if (fatherName !== undefined) updateData.fatherName = fatherName || null
    if (motherName !== undefined) updateData.motherName = motherName || null
    if (parentContact !== undefined) updateData.parentContact = parentContact || null
    if (joiningYear !== undefined) updateData.joiningYear = joiningYear ? parseInt(joiningYear.toString()) : undefined
    if (status !== undefined) updateData.status = status
    if (role !== undefined) updateData.role = role

    const student = await db.student.update({
      where: { id: studentId },
      data: updateData
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "STUDENT_UPDATED",
      entityType: "STUDENT",
      entityId: student.id,
      details: `Admin updated details for student: ${student.federationId}`
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error("[STUDENT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
