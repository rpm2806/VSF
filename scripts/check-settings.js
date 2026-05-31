const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const settings = await prisma.systemSetting.findMany();
    console.log("---------------------------------------------------------");
    console.log("📊 SYSTEM SETTINGS:");
    console.log("---------------------------------------------------------");
    settings.forEach((s) => {
      console.log(`${s.key}: ${s.value}`);
    });
    console.log("---------------------------------------------------------");
  } catch (error) {
    console.error("❌ Error querying settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
