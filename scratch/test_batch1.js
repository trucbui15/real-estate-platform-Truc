const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProject(slug) {
  const p = await prisma.project.findUnique({
    where: { slug },
    include: {
      website: true,
      resources: { where: { isActive: true, isPublic: true } },
      inventories: true,
      listings: { where: { unitStatus: { in: ['DANG_BAN', 'DANG_CHO_THUE'] } } }
    }
  });

  if (!p) {
    console.log(`[FAIL] Project not found: ${slug}`);
    return;
  }

  console.log(`\n========================================`);
  console.log(`[TEST PROJECT]: ${p.name} (${p.slug})`);
  console.log(`- Has ProjectWebsite: ${!!p.website}`);
  console.log(`- Inventory count: ${p.inventories.length}`);
  console.log(`- Listing count: ${p.listings.length}`);
  console.log(`- Resource count: ${p.resources.length}`);

  const tour360 = p.resources.find(r => r.type === 'TOUR_360');
  console.log(`- Has Tour 360: ${!!tour360}`);

  // Test dynamic sections calculation
  const hasFloorPlansContent = p.resources.some(r => r.type === 'FLOOR_PLAN' || r.type === 'DESIGN_FILE');
  const hasUnitTypesContent = p.inventories.length > 0 || p.listings.length > 0;
  const hasGalleryContent = !!p.thumbnail || p.resources.some(r => r.type === 'IMAGE');
  const hasVideoContent = !!tour360 || p.resources.some(r => r.type === 'VIDEO');
  const hasDocsContent = p.resources.length > 0;

  console.log(`- Active Sections:`);
  console.log(`  * Overview: YES`);
  console.log(`  * Location: YES (${p.address || 'Default address'})`);
  console.log(`  * Floor Plans: ${hasFloorPlansContent ? 'YES' : 'HIDDEN'}`);
  console.log(`  * Units/Inventory: ${hasUnitTypesContent ? 'YES' : 'HIDDEN'}`);
  console.log(`  * Gallery: ${hasGalleryContent ? 'YES' : 'HIDDEN'}`);
  console.log(`  * Video 360°: ${hasVideoContent ? 'YES' : 'HIDDEN'}`);
  console.log(`  * Documents: ${hasDocsContent ? 'YES' : 'HIDDEN'}`);
}

async function main() {
  await testProject('simona-heights-quy-nhon');
  await testProject('altara-residences-quy-nhon');
  await testProject('the-sailing-quy-nhon-i-tower-toa-b');
  await testProject('phu-tai-residence-quy-nhon');
}

main().finally(() => prisma.$disconnect());
