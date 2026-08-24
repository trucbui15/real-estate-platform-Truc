const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const allProjectsToTest = [
  // Master
  { slug: 'simona-heights-quy-nhon', tag: 'Master Template' },
  // Batch 1
  { slug: 'altara-residences-quy-nhon', tag: 'Batch 1' },
  { slug: 'the-sailing-quy-nhon-i-tower-toa-b', tag: 'Batch 1' },
  { slug: 'phu-tai-residence-quy-nhon', tag: 'Batch 1' },
  // Batch 2
  { slug: 'the-ocean-villas-quy-nhon', tag: 'Batch 2' },
  { slug: 'phu-tai-central-life-quy-nhon', tag: 'Batch 2' },
  { slug: 'ecolife-riverside-quy-nhon', tag: 'Batch 2' },
  { slug: 'the-hera-resort', tag: 'Batch 2' },
  // Batch 3
  { slug: 'best-western-premier-sailing-quy-nhon-toa-a', tag: 'Batch 3' },
  { slug: 'tms-luxury-quy-nhon', tag: 'Batch 3' },
  { slug: 'kdt-richmond-hung-thinh', tag: 'Batch 3' },
  { slug: 'solera-quy-nhon', tag: 'Batch 3' },
];

async function main() {
  console.log("=== COMPREHENSIVE TEST (MASTER + BATCH 1 + BATCH 2 + BATCH 3) ===");

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

    console.log(`[${item.tag}] ${p.name} (/du-an/${p.slug}) | WS: ${p.website ? p.website.status : 'AUTO-GENERATED FALLBACK'} | Inv:${p.inventories.length} List:${p.listings.length} Res:${p.resources.length} 360:${!!tour360} | Active (${activeSections.length}): ${activeSections.join(',')} | Hidden: ${hiddenSections.join(',') || 'None'}`);
  }
}

main().finally(() => prisma.$disconnect());
