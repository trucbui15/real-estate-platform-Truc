const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const simona = await prisma.project.findUnique({
    where: { slug: 'simona-heights-quy-nhon' },
    include: { website: true }
  });

  if (simona && simona.website) {
    console.log("=== SIMONA SECTIONS CONFIG ===");
    console.log(simona.website.publishedSectionsConfig);
    console.log("=== SIMONA CONTENT JSON ===");
    console.log(simona.website.publishedContentJson?.slice(0, 1500));
  }
}

main().finally(() => prisma.$disconnect());
