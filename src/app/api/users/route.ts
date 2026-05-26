import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { logActivity } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "VOLUNTEER",
        status: "ACTIVE"
      }
    })

    await logActivity({
      userId: session.user.id,
      action: "VOLUNTEER_CREATED",
      entityType: "USER",
      entityId: user.id,
      details: `Created new volunteer: ${name} (${email})`
    })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email })
  } catch (error) {
    console.error("[USERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
