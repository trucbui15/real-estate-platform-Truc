const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Checking and adding COLLABORATOR_PRO to Role enum in Postgres...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COLLABORATOR_PRO';`);
    console.log("SUCCESS: Added COLLABORATOR_PRO to Role enum!");
  } catch (e) {
    console.log("Result/Notice:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
