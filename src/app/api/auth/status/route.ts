import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { identifier, dob } = body

    if (!identifier || !dob) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const student = await db.student.findFirst({
      where: { 
        dob,
        deletedAt: null,
        OR: [
          { mobileNumber: identifier },
          { aadhaarNumber: identifier }
        ]
      }
    })

    if (!student) {
      return NextResponse.json({ status: "INVALID" })
    }

    return NextResponse.json({ status: student.status })
  } catch (error) {
    console.error("[AUTH_STATUS_CHECK]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
