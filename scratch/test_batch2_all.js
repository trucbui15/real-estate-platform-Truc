const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const allProjectsToTest = [
  // Regression check (Master + Batch 1)
  { slug: 'simona-heights-quy-nhon', tag: 'Master Template' },
  { slug: 'altara-residences-quy-nhon', tag: 'Batch 1' },
  { slug: 'the-sailing-quy-nhon-i-tower-toa-b', tag: 'Batch 1' },
  { slug: 'phu-tai-residence-quy-nhon', tag: 'Batch 1' },
  // Batch 2
  { slug: 'the-ocean-villas-quy-nhon', tag: 'Batch 2' },
  { slug: 'phu-tai-central-life-quy-nhon', tag: 'Batch 2' },
  { slug: 'ecolife-riverside-quy-nhon', tag: 'Batch 2' },
  { slug: 'the-hera-resort', tag: 'Batch 2' },
];

async function main() {
  console.log("=== COMPREHENSIVE TEST (BATCH 1 REGRESSION + BATCH 2) ===");

  for (const item of allProjectsToTest) {
    const p = await prisma.project.findUnique({
      where: { slug: item.slug },
      include: {
        website: true,
        resources: { where: { isActive: true, isPublic: true } },
        inventories: true,
        listings: { where: { unitStatus: { in: ['DANG_BAN', 'DANG_CHO_THUE'] } } },
        province: true,
        district: true
      }
    });

    if (!p) {
      console.log(`[FAIL] ${item.slug} not found`);
      continue;
    }

    const tour360 = p.resources.find(r => r.type === 'TOUR_360');
    const video = p.resources.find(r => r.type === 'VIDEO');
    const floorPlans = p.resources.filter(r => r.type === 'FLOOR_PLAN' || r.type === 'DESIGN_FILE');
    const images = p.resources.filter(r => r.type === 'IMAGE');
    const policy = p.resources.filter(r => r.type === 'SALES_POLICY' || r.type === 'PRICE_LIST');

    const activeSections = [
      'Hero',
      'Overview',
      (p.address || p.district) && 'Location',
      (floorPlans.length > 0) && 'Floor Plans',
      (p.inventories.length > 0 || p.listings.length > 0) && 'Units/Inventory',
      (p.thumbnail || images.length > 0) && 'Gallery',
      (tour360 || video) && 'Video 360°',
      (policy.length > 0) && 'Policy',
      (p.resources.length > 0) && 'Documents',
      'Contact'
    ].filter(Boolean);

    const hiddenSections = [
      !floorPlans.length && 'Floor Plans',
      !(p.inventories.length || p.listings.length) && 'Units/Inventory',
      !(p.thumbnail || images.length) && 'Gallery',
      !(tour360 || video) && 'Video 360°',
      !policy.length && 'Policy',
      !p.resources.length && 'Documents'
    ].filter(Boolean);

    console.log(`\n----------------------------------------`);
    console.log(`[${item.tag}] ${p.name} (/du-an/${p.slug})`);
    console.log(`- ProjectWebsite: ${p.website ? p.website.status : 'AUTO-GENERATED FALLBACK MICROSITE'}`);
    console.log(`- Data Stats: Inventories=${p.inventories.length}, Listings=${p.listings.length}, PublicResources=${p.resources.length}`);
    console.log(`- 360 Tour: ${tour360 ? 'YES (' + tour360.url + ')' : 'NO'}`);
    console.log(`- Active Sections (${activeSections.length}): ${activeSections.join(', ')}`);
    console.log(`- Hidden Sections (${hiddenSections.length}): ${hiddenSections.join(', ')}`);
  }
}

main().finally(() => prisma.$disconnect());
