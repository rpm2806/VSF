import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { sendApprovalEmail } from "@/lib/email"

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
    if (fullName !== undefined) updateData.fullName = fullName ? fullName.toUpperCase() : ""
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber
    if (email !== undefined) updateData.email = email ? email.toUpperCase() : null
    if (batch !== undefined) updateData.batch = batch ? batch.toUpperCase() : null
    if (studentClass !== undefined) updateData.class = studentClass ? studentClass.toUpperCase() : null
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup ? bloodGroup.toUpperCase() : null
    if (aadhaarNumber !== undefined) updateData.aadhaarNumber = aadhaarNumber ? aadhaarNumber.toUpperCase() : null
    if (dob !== undefined) updateData.dob = dob || null
    const currentStudent = await db.student.findUnique({ where: { id: studentId } })
    if (!currentStudent) return new NextResponse("Student not found", { status: 404 })

    const existingDateStr = currentStudent.donationStartDate 
      ? new Date(currentStudent.donationStartDate).toISOString().split('T')[0] 
      : ""
    const newDateStr = donationStartDate 
      ? new Date(donationStartDate).toISOString().split('T')[0] 
      : ""

    const dateChanged = donationStartDate !== undefined && newDateStr !== existingDateStr

    if (dateChanged) {
      updateData.donationStartDate = donationStartDate ? new Date(donationStartDate) : null
      updateData.duesAmount = 0
    } else if (duesAmount !== undefined) {
      const parsedDues = parseFloat(duesAmount.toString())
      if (!isNaN(parsedDues)) {
        const donationsSum = await db.donation.aggregate({
          _sum: { amount: true },
          where: { studentId, status: "PAID", deletedAt: null }
        })
        const totalDonations = donationsSum._sum.amount || 0

        const effectiveStartDate = currentStudent.donationStartDate || currentStudent.createdAt
        let currentPendingDues = 0
        if (effectiveStartDate) {
          const startIST = new Date(new Date(effectiveStartDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
          const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
          const startUTC = Date.UTC(startIST.getFullYear(), startIST.getMonth(), startIST.getDate())
          const nowUTC = Date.UTC(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate())
          const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))
          
          if (diffDays >= 0) {
            const totalDays = diffDays + 1
            const totalOwed = (totalDays * 1) + (currentStudent.duesAmount || 0)
            currentPendingDues = totalOwed - totalDonations
          } else {
            const advanceDays = Math.abs(diffDays)
            const advanceBal = totalDonations - (currentStudent.duesAmount || 0) + advanceDays
            currentPendingDues = -advanceBal
          }
        }

        if (parsedDues !== currentPendingDues) {
          const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
          todayIST.setHours(0, 0, 0, 0)

          const totalDaysNeeded = totalDonations + parsedDues
          const startIST = new Date(todayIST)
          if (totalDaysNeeded >= 0) {
            startIST.setDate(startIST.getDate() - (Math.round(totalDaysNeeded) - 1))
          } else {
            startIST.setDate(startIST.getDate() + Math.abs(Math.round(totalDaysNeeded)))
          }

          updateData.donationStartDate = startIST
          updateData.duesAmount = 0
        }
      }
    }
    if (lastSchool !== undefined) updateData.lastSchool = lastSchool ? lastSchool.toUpperCase() : null
    if (specialization !== undefined) updateData.specialization = specialization ? specialization.toUpperCase() : null
    if (permanentAddress !== undefined) updateData.permanentAddress = permanentAddress ? permanentAddress.toUpperCase() : null
    if (currentAddress !== undefined) updateData.currentAddress = currentAddress ? currentAddress.toUpperCase() : null
    if (bio !== undefined) updateData.bio = bio ? bio.toUpperCase() : null
    if (workingAt !== undefined) updateData.workingAt = workingAt ? workingAt.toUpperCase() : null
    if (fatherName !== undefined) updateData.fatherName = fatherName ? fatherName.toUpperCase() : null
    if (motherName !== undefined) updateData.motherName = motherName ? motherName.toUpperCase() : null
    if (parentContact !== undefined) updateData.parentContact = parentContact || null
    if (joiningYear !== undefined) updateData.joiningYear = joiningYear ? parseInt(joiningYear.toString()) : undefined
    if (status !== undefined) updateData.status = status ? status.toUpperCase() : undefined
    if (role !== undefined) updateData.role = role ? role.toUpperCase() : undefined

    const oldStudent = await db.student.findUnique({
      where: { id: studentId }
    })

    const student = await db.student.update({
      where: { id: studentId },
      data: updateData
    })

    // If student is approved (transitioning from PENDING_APPROVAL to ACTIVE)
    if (oldStudent && oldStudent.status === "PENDING_APPROVAL" && student.status === "ACTIVE" && student.email) {
      try {
        await sendApprovalEmail(student.email, student.fullName, student.federationId)
      } catch (err) {
        console.error("Failed to send approval email:", err)
      }
    }

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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params
    const studentId = resolvedParams.id

    // Soft delete the student
    const student = await db.student.update({
      where: { id: studentId },
      data: { deletedAt: new Date() }
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "STUDENT_DELETED",
      entityType: "STUDENT",
      entityId: studentId,
      details: `Admin moved student to recycle bin: ${student.fullName} (${student.federationId})`
    })

    return NextResponse.json({ success: true, message: "Student moved to recycle bin successfully" })
  } catch (error) {
    console.error("[STUDENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
