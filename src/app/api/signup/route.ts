import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { uploadBuffer } from "@/lib/cloudinary"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // Extract textual fields
    const fullName = (formData.get("fullName") as string || "").toUpperCase()
    const mobileNumber = formData.get("mobileNumber") as string
    const email = (formData.get("email") as string || "").toUpperCase()
    const role = (formData.get("role") as string || "STUDENT").toUpperCase()
    const joiningYear = formData.get("joiningYear") as string
    const batch = (formData.get("batch") as string || "").toUpperCase()
    const studentClass = (formData.get("class") as string || "").toUpperCase()
    const bloodGroup = (formData.get("bloodGroup") as string || "").toUpperCase()
    const aadhaarNumber = (formData.get("aadhaarNumber") as string || "").toUpperCase()
    const dob = formData.get("dob") as string
    const fatherName = (formData.get("fatherName") as string || "").toUpperCase()
    const motherName = (formData.get("motherName") as string || "").toUpperCase()
    const parentContact = formData.get("parentContact") as string
    const lastSchool = (formData.get("lastSchool") as string || "").toUpperCase()
    const specialization = (formData.get("specialization") as string || "").toUpperCase()
    const permanentAddress = (formData.get("permanentAddress") as string || "").toUpperCase()
    const currentAddress = (formData.get("currentAddress") as string || "").toUpperCase()
    const bio = (formData.get("bio") as string || "").toUpperCase()
    const workingAt = (formData.get("workingAt") as string || "").toUpperCase()

    // Check existing
    if (mobileNumber) {
      const existing = await db.student.findUnique({ where: { mobileNumber } })
      if (existing) {
        return NextResponse.json({ error: "Mobile number already registered." }, { status: 400 })
      }
    }
    if (aadhaarNumber) {
      const existing = await db.student.findUnique({ where: { aadhaarNumber } })
      if (existing) {
        return NextResponse.json({ error: "Aadhaar number already registered." }, { status: 400 })
      }
    }

    // Extract files
    const profileImageFile = formData.get("profileImage") as File | null
    const idProofImageFile = formData.get("idProofImage") as File | null

    const saveFileToCloudinary = async (file: File | null, folder: string) => {
      if (!file || typeof file === "string" || file.size === 0) return null
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      return await uploadBuffer(buffer, folder)
    }

    const profileImage = await saveFileToCloudinary(profileImageFile, "vriksh_students")
    const idProofImage = await saveFileToCloudinary(idProofImageFile, "vriksh_ids")

    // Generate VSF ID
    const yearCount = await db.student.count({
      where: { joiningYear: parseInt(joiningYear || new Date().getFullYear().toString()) }
    })

    const formatSetting = await db.systemSetting.findUnique({
      where: { key: "federationIdFormat" }
    })
    const formatString = formatSetting?.value || "VSF{YY}{000}"

    const jYear = parseInt(joiningYear || new Date().getFullYear().toString())
    const yy = String(jYear).slice(-2)
    const yyyy = String(jYear)

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
        fullName,
        mobileNumber,
        email: email || null,
        batch: batch || null,
        class: studentClass || null,
        bloodGroup: bloodGroup || null,
        aadhaarNumber: aadhaarNumber || null,
        dob: dob || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        parentContact: parentContact || null,
        lastSchool: lastSchool || null,
        specialization: specialization || null,
        permanentAddress: permanentAddress || null,
        currentAddress: currentAddress || null,
        bio: bio || null,
        workingAt: workingAt || null,
        joiningYear: jYear,
        status: "PENDING_APPROVAL",
        role: role, // STUDENT or ALUMNI
        profileImage,
        idProofImage
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error("[SIGNUP_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
