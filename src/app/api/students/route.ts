import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { generateLowestUnusedFederationId } from "@/lib/id-generator"
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

    // Extract textual fields
    const fullName = formData.get("fullName") as string
    const mobileNumber = formData.get("mobileNumber") as string
    const joiningYear = formData.get("joiningYear") as string
    const email = formData.get("email") as string
    const batch = formData.get("batch") as string
    const studentClass = formData.get("class") as string
    const bloodGroup = formData.get("bloodGroup") as string
    const aadhaarNumber = formData.get("aadhaarNumber") as string
    const dob = formData.get("dob") as string
    const duesAmount = formData.get("duesAmount") as string
    const donationStartDate = formData.get("donationStartDate") as string
    const lastSchool = formData.get("lastSchool") as string
    const specialization = formData.get("specialization") as string
    const permanentAddress = formData.get("permanentAddress") as string
    const currentAddress = formData.get("currentAddress") as string
    const bio = formData.get("bio") as string
    const workingAt = formData.get("workingAt") as string
    const fatherName = formData.get("fatherName") as string
    const motherName = formData.get("motherName") as string
    const parentContact = formData.get("parentContact") as string

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

    // Generate VSF ID using gap-filling allocation
    const federationId = await generateLowestUnusedFederationId(parseInt(joiningYear))

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
        duesAmount: 0,
        donationStartDate: (() => {
          if (donationStartDate) return new Date(donationStartDate);
          const parsedDues = parseFloat(duesAmount || "0");
          if (!isNaN(parsedDues) && parsedDues !== 0) {
            const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            todayIST.setHours(0, 0, 0, 0);
            const startIST = new Date(todayIST);
            if (parsedDues > 0) {
              startIST.setDate(startIST.getDate() - (Math.round(parsedDues) - 1));
            } else {
              startIST.setDate(startIST.getDate() + Math.abs(Math.round(parsedDues)));
            }
            return startIST;
          }
          return null;
        })(),
        lastSchool: lastSchool ? lastSchool.toUpperCase() : null,
        specialization: specialization ? specialization.toUpperCase() : null,
        permanentAddress: permanentAddress ? permanentAddress.toUpperCase() : null,
        currentAddress: currentAddress ? currentAddress.toUpperCase() : null,
        bio: bio ? bio.toUpperCase() : null,
        workingAt: workingAt ? workingAt.toUpperCase() : null,
        fatherName: fatherName ? fatherName.toUpperCase() : null,
        motherName: motherName ? motherName.toUpperCase() : null,
        parentContact: parentContact || null,
        joiningYear: parseInt(joiningYear),
        status: "ACTIVE",
        role: "STUDENT",
        profileImage,
        idProofImage,
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
