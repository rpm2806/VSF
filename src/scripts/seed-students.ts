import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Diya", "Isha", "Ananya", "Aadhya", "Pari", "Navya", "Riya", "Kavya", "Avni", "Sneha", "Rahul", "Rohan", "Sanjay", "Vikram", "Neha", "Pooja", "Anjali", "Swati", "Nikhil", "Amit"]
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Das", "Bose", "Ghosh", "Jain", "Mehta", "Chawla", "Agarwal", "Reddy", "Nair", "Iyer", "Rao", "Joshi", "Kulkarni", "Deshmukh"]
const classes = ["8th", "9th", "10th", "11th", "12th", "B.Tech", "B.Sc", "B.Com", "B.A."]
const batches = ["Batch A", "Batch B", "Morning", "Evening"]

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomMobile() {
  const firstDigit = ["9", "8", "7"][Math.floor(Math.random() * 3)]
  let rest = ""
  for(let i=0; i<9; i++) {
    rest += Math.floor(Math.random() * 10).toString()
  }
  return firstDigit + rest
}

async function main() {
  console.log("Generating 100 dummy students...")

  const currentYear = new Date().getFullYear()
  
  // Get current count to start ID generation properly
  const yearCount = await prisma.student.count({
    where: { joiningYear: currentYear }
  })

  const studentsToCreate = []

  for (let i = 1; i <= 100; i++) {
    const fullName = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`
    const mobileNumber = generateRandomMobile()
    const studentClass = getRandomItem(classes)
    const batch = getRandomItem(batches)
    const countPadded = String(yearCount + i).padStart(4, '0')
    const federationId = `VSF-${currentYear}-SCH-${countPadded}`

    studentsToCreate.push({
      federationId,
      fullName,
      mobileNumber,
      email: `student${yearCount + i}@example.com`,
      class: studentClass,
      batch,
      joiningYear: currentYear,
      role: "STUDENT",
      status: "ACTIVE",
    })
  }

  // Insert using Prisma createMany
  await prisma.student.createMany({
    data: studentsToCreate
  })

  console.log(`Successfully added ${studentsToCreate.length} students!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
