const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const websites = await prisma.projectWebsite.findMany();
  console.log("PROJECT WEBSITES:", JSON.stringify(websites, null, 2));
}

main().finally(() => prisma.$disconnect());
