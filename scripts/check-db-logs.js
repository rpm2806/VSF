const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });

    console.log("---------------------------------------------------------");
    console.log("📊 RECENT AUDIT LOGS:");
    console.log("---------------------------------------------------------");
    logs.forEach((log) => {
      console.log(`Action: ${log.action}`);
      console.log(`Entity: ${log.entityType} (ID: ${log.entityId})`);
      console.log(`Details: ${log.details}`);
      console.log(`Time: ${log.createdAt}`);
      console.log("---------------------------------------------------------");
    });
  } catch (error) {
    console.error("❌ Error querying audit logs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
