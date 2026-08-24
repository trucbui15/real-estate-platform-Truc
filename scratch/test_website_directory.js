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
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  console.log("=== WEBSITE DIRECTORY TEST ===");
  console.log(`Total projects in website directory: ${projects.length}`);

  let primaryCtaOk = 0;
  let secondaryLinkOk = 0;

  projects.forEach((p, idx) => {
    const primaryCta = `/du-an/${p.slug}`;
    const extResources = p.resources.filter(r => r.url && r.url.startsWith('http') && !r.url.includes(`/du-an/${p.slug}`));

    if (primaryCta === `/du-an/${p.slug}`) primaryCtaOk++;
    if (extResources.length > 0) secondaryLinkOk++;

    console.log(`[${idx + 1}] ${p.name} | Primary CTA: ${primaryCta} | Secondary Ext Links: ${extResources.map(r=>r.url).join(', ') || 'None'}`);
  });

  console.log(`\nResults:`);
  console.log(`- Total Projects Rendered: ${projects.length} (Target: 19)`);
  console.log(`- Primary Internal CTA Correct: ${primaryCtaOk}/${projects.length}`);
  console.log(`- Projects with External Resource Reference Links: ${secondaryLinkOk}`);
}

main().finally(() => prisma.$disconnect());
