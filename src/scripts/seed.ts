import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const adminPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@vrikshsf.org" },
    update: {},
    create: {
      name: "Master Admin",
      email: "admin@vrikshsf.org",
      password: adminPassword,
      role: "MASTER_ADMIN",
      status: "ACTIVE",
    },
  })

  console.log("Created master admin:", admin.email)
  
  // Create a mock student for testing
  const student = await prisma.student.upsert({
    where: { mobileNumber: "9876543210" },
    update: {},
    create: {
      federationId: "VSF-2026-SCH-0001",
      fullName: "Test Student",
      mobileNumber: "9876543210",
      email: "student@test.com",
      joiningYear: 2026,
      role: "STUDENT",
      status: "ACTIVE",
    }
  })
  
  console.log("Created test student:", student.mobileNumber)

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
