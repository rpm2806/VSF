import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const settings = await db.systemSetting.findMany()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value
      return acc
    }, {})
    
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("[SETTINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "MASTER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { key, value } = await req.json()

    if (!key || typeof value !== "string") {
      return new NextResponse("Invalid data", { status: 400 })
    }

    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error("[SETTINGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
