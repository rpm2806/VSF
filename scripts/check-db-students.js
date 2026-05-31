const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });

    console.log("---------------------------------------------------------");
    console.log("📊 RECENTLY REGISTERED STUDENTS IN THE DATABASE:");
    console.log("---------------------------------------------------------");
    students.forEach((s) => {
      console.log(`ID: ${s.id}`);
      console.log(`Fed ID: ${s.federationId}`);
      console.log(`Name: ${s.fullName}`);
      console.log(`Email: ${s.email}`);
      console.log(`Status: ${s.status}`);
      console.log(`Created At: ${s.createdAt}`);
      console.log(`Deleted At: ${s.deletedAt}`);
      console.log("---------------------------------------------------------");
    });
  } catch (error) {
    console.error("❌ Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
