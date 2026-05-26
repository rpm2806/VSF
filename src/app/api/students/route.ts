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
      workingAt
    } = body

    // Generate VSF ID
    const yearCount = await db.student.count({
      where: { joiningYear: parseInt(joiningYear) }
    })

    const formatSetting = await db.systemSetting.findUnique({
      where: { key: "federationIdFormat" }
    })
    const formatString = formatSetting?.value || "VSF{YY}{000}"

    const yy = String(joiningYear).slice(-2)
    const yyyy = String(joiningYear)

    let federationId = formatString.replace(/{YY}/g, yy).replace(/{YYYY}/g, yyyy)

    const paddingMatch = federationId.match(/\{0+\}/)
    if (paddingMatch) {
      const paddingLength = paddingMatch[0].length - 2 // remove { and }
      const countPadded = String(yearCount + 1).padStart(paddingLength, '0')
      federationId = federationId.replace(paddingMatch[0], countPadded)
    } else {
      federationId += String(yearCount + 1)
    }

    const student = await db.student.create({
      data: {
        federationId,
        fullName: (fullName || "").toUpperCase(),
        mobileNumber,
        email: email ? email.toUpperCase() : null,
        batch: batch ? batch.toUpperCase() : null,
        class: studentClass ? studentClass.toUpperCase() : null,
        bloodGroup: bloodGroup ? bloodGroup.toUpperCase() : null,
        aadhaarNumber: aadhaarNumber ? aadhaarNumber.toUpperCase() : null,
        dob: dob || null,
        duesAmount: duesAmount ? parseFloat(duesAmount) : 0,
        donationStartDate: donationStartDate ? new Date(donationStartDate) : null,
        lastSchool: lastSchool ? lastSchool.toUpperCase() : null,
        specialization: specialization ? specialization.toUpperCase() : null,
        permanentAddress: permanentAddress ? permanentAddress.toUpperCase() : null,
        currentAddress: currentAddress ? currentAddress.toUpperCase() : null,
        bio: bio ? bio.toUpperCase() : null,
        workingAt: workingAt ? workingAt.toUpperCase() : null,
        joiningYear: parseInt(joiningYear),
        status: "ACTIVE",
        role: "STUDENT",
      }
    })

    // Log Activity
    await logActivity({
      userId: session.user.id,
      action: "STUDENT_ADDED",
      entityType: "STUDENT",
      entityId: student.id,
      details: `Added new student: ${federationId} (${fullName})`
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error("[STUDENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
