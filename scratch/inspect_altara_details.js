const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const altara = await prisma.project.findFirst({
    where: { slug: "altara-residences-quy-nhon" },
    include: {
      resources: true,
      inventories: { take: 5 },
      listings: true,
      website: true,
    }
  });

  console.log("Altara Project:", JSON.stringify(altara, null, 2));
}

main().finally(() => prisma.$disconnect());
