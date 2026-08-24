const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      resources: {
        where: {
          type: "WEBSITE",
          isActive: true,
          isPublic: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
      district: true,
      province: true,
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  console.log(`TOTAL ACTIVE PROJECTS: ${projects.length}`);
  console.log("----------------------------------------");

  projects.forEach((p, idx) => {
    const extWebsites = p.resources.map(r => r.url);
    console.log(`${idx + 1}. [${p.name}] (slug: ${p.slug})`);
    console.log(`   - Internal Microsite Link: /du-an/${p.slug}`);
    console.log(`   - External Website Resources: ${extWebsites.length > 0 ? extWebsites.join(', ') : 'None'}`);
  });
}

main().finally(() => prisma.$disconnect());
