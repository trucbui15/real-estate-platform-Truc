const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: { name: { contains: "Simona" } },
    include: { website: true, resources: true },
  });
  console.log("SIMONA PROJECTS:", JSON.stringify(projects, null, 2));
}

main().finally(() => prisma.$disconnect());
