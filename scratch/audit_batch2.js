const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const batch2Slugs = [
  'the-ocean-villas-quy-nhon',
  'phu-tai-central-life-quy-nhon',
  'ecolife-riverside-quy-nhon',
  'the-hera-resort'
];

async function main() {
  console.log("=== BATCH 2 PROJECTS AUDIT ===");

  for (const slug of batch2Slugs) {
    const p = await prisma.project.findUnique({
      where: { slug },
      include: {
        website: true,
        resources: {
          where: { isActive: true, isPublic: true },
          orderBy: { sortOrder: 'asc' }
        },
        inventories: true,
        listings: {
          where: { unitStatus: { in: ['DANG_BAN', 'DANG_CHO_THUE'] } },
          include: { author: true }
        },
        province: true,
        district: true
      }
    });

    if (!p) {
      console.log(`[NOT FOUND] ${slug}`);
      continue;
    }

    console.log(`\n----------------------------------------`);
    console.log(`[PROJECT]: ${p.name}`);
    console.log(`- Slug: ${p.slug}`);
    console.log(`- Address: ${p.address || [p.district?.name, p.province?.name].filter(Boolean).join(', ') || 'N/A'}`);
    console.log(`- Developer: ${p.developer || 'N/A'}`);
    console.log(`- Has ProjectWebsite: ${!!p.website} (Status: ${p.website?.status || 'NO_WEBSITE'})`);
    console.log(`- Inventory Count: ${p.inventories.length}`);
    console.log(`- Listing Count: ${p.listings.length}`);
    console.log(`- Public Resources Count: ${p.resources.length}`);

    const resourceTypes = p.resources.map(r => r.type);
    console.log(`- Resource Types:`, Array.from(new Set(resourceTypes)));

    const tour360 = p.resources.find(r => r.type === 'TOUR_360');
    console.log(`- Has 360 Tour: ${!!tour360}`);

    // Check active vs hidden sections
    const hasFloorPlans = p.resources.some(r => r.type === 'FLOOR_PLAN' || r.type === 'DESIGN_FILE');
    const hasUnits = p.inventories.length > 0 || p.listings.length > 0;
    const hasGallery = !!p.thumbnail || p.resources.some(r => r.type === 'IMAGE');
    const hasVideo = !!tour360 || p.resources.some(r => r.type === 'VIDEO');
    const hasDocs = p.resources.length > 0;
    const hasPolicy = p.resources.some(r => r.type === 'SALES_POLICY' || r.type === 'PRICE_LIST');

    console.log(`- Active Sections: Overview, Location, Gallery (${hasGallery}), Video 360° (${hasVideo}), Documents (${hasDocs}), Policy (${hasPolicy}), Floor Plans (${hasFloorPlans}), Units/Inventory (${hasUnits})`);
    console.log(`- Hidden Sections: ${[!hasFloorPlans && 'Floor Plans', !hasUnits && 'Units/Inventory', !hasGallery && 'Gallery', !hasVideo && 'Video 360°', !hasDocs && 'Documents', !hasPolicy && 'Policy'].filter(Boolean).join(', ') || 'None'}`);
  }
}

main().finally(() => prisma.$disconnect());
