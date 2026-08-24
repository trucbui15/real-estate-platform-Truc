const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      website: true,
      resources: true,
      inventories: true,
      listings: true,
    }
  });

  console.log("=== PROJECTS WITH WEBSITE ===");
  projects.filter(p => p.website).forEach(p => {
    console.log(`- ${p.name} (${p.slug}): Status=${p.website.status}, HasPublishedJson=${!!p.website.publishedContentJson}, HasDraftJson=${!!p.website.draftContentJson}`);
  });

  console.log("\n=== ALL PROJECTS LIST ===");
  projects.forEach(p => {
    console.log(`[${p.id}] ${p.name} (slug: ${p.slug})`);
    console.log(`  - Website: ${p.website ? p.website.status : 'None'}`);
    console.log(`  - Resources: ${p.resources.length} (360: ${p.resources.some(r=>r.type==='TOUR_360')})`);
    console.log(`  - Inventory: ${p.inventories.length}`);
    console.log(`  - Listings: ${p.listings.length}`);
  });
}

main().finally(() => prisma.$disconnect());
