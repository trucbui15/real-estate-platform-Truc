const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({
    where: { slug: "simona-heights" },
    include: { website: true, resources: true },
  });
  console.log("PROJECT:", JSON.stringify(project, null, 2));
}

main().finally(() => prisma.$disconnect());
