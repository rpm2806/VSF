const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Starting uppercase migration backfill...")
  const students = await prisma.student.findMany()
  console.log(`Found ${students.length} students to process.`)

  let updatedCount = 0
  for (const student of students) {
    const uppercaseData = {}
    
    const textFields = [
      "fullName", "email", "fatherName", "motherName", "bloodGroup", 
      "class", "batch", "lastSchool", "specialization", "permanentAddress", 
      "currentAddress", "bio", "workingAt", "role", "status"
    ]

    for (const field of textFields) {
      if (student[field] && typeof student[field] === "string") {
        const upper = student[field].toUpperCase()
        if (student[field] !== upper) {
          uppercaseData[field] = upper
        }
      }
    }

    if (Object.keys(uppercaseData).length > 0) {
      await prisma.student.update({
        where: { id: student.id },
        data: uppercaseData
      })
      updatedCount++
    }
  }

  console.log(`Successfully updated ${updatedCount} students to uppercase.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
