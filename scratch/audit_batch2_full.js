const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const batch2Slugs = [
  'the-ocean-villas-quy-nhon',
  'phu-tai-central-life-quy-nhon',
  'ecolife-riverside-quy-nhon',
  'the-hera-resort'
];

async function main() {
  for (const slug of batch2Slugs) {
    const p = await prisma.project.findUnique({
      where: { slug },
      include: {
        website: true,
        resources: { where: { isActive: true, isPublic: true } },
        inventories: true,
        listings: { where: { unitStatus: { in: ['DANG_BAN', 'DANG_CHO_THUE'] } } },
        province: true,
        district: true
      }
    });

    if (!p) continue;

    const tour360 = p.resources.find(r => r.type === 'TOUR_360');
    const video = p.resources.find(r => r.type === 'VIDEO');
    const floorPlans = p.resources.filter(r => r.type === 'FLOOR_PLAN' || r.type === 'DESIGN_FILE');
    const images = p.resources.filter(r => r.type === 'IMAGE');
    const policy = p.resources.filter(r => r.type === 'SALES_POLICY' || r.type === 'PRICE_LIST');

    const activeSections = [
      'Hero',
      'Overview',
      p.address && 'Location',
      floorPlans.length > 0 && 'Floor Plans',
      (p.inventories.length > 0 || p.listings.length > 0) && 'Units/Inventory',
      (p.thumbnail || images.length > 0) && 'Gallery',
      (tour360 || video) && 'Video 360°',
      policy.length > 0 && 'Policy',
      p.resources.length > 0 && 'Documents',
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

    console.log(`\n=== [${p.name}] ===`);
    console.log(`Slug: /du-an/${p.slug}`);
    console.log(`Address: ${p.address || [p.district?.name, p.province?.name].filter(Boolean).join(', ')}`);
    console.log(`Developer: ${p.developer || 'N/A'}`);
    console.log(`Website status: ${p.website ? p.website.status : 'AUTO-GENERATED FALLBACK MICROSITE'}`);
    console.log(`Inventory: ${p.inventories.length} | Listing: ${p.listings.length} | Resources: ${p.resources.length}`);
    console.log(`Has 360 Tour: ${!!tour360} | Has Video: ${!!video}`);
    console.log(`Active Sections (${activeSections.length}): ${activeSections.join(', ')}`);
    console.log(`Hidden Sections (${hiddenSections.length}): ${hiddenSections.join(', ')}`);
  }
}

main().finally(() => prisma.$disconnect());
