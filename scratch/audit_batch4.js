const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const batch4Slugs = [
  'nhon-hoi-newcity',
  'quy-nhon-iconic-bac-ha-thanh',
  'quy-nhon-melody-hung-thinh',
  'kdt-an-phu-thinh',
  'merryland-quy-nhon',
  'q-terra-q1-tower',
  'oriva-bay-quy-nhon'
];

async function main() {
  console.log("=== BATCH 4 PROJECTS AUDIT ===");

  for (const slug of batch4Slugs) {
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

    const tour360 = p.resources.find(r => r.type === 'TOUR_360');
    const video = p.resources.find(r => r.type === 'VIDEO');
    const floorPlans = p.resources.filter(r => r.type === 'FLOOR_PLAN' || r.type === 'DESIGN_FILE');
    const images = p.resources.filter(r => r.type === 'IMAGE');
    const policy = p.resources.filter(r => r.type === 'SALES_POLICY' || r.type === 'PRICE_LIST');

    let parsedImages = [];
    if (p.images) {
      try {
        const arr = JSON.parse(p.images);
        if (Array.isArray(arr)) parsedImages = arr;
      } catch(e) {}
    }

    const activeSections = [
      'Hero',
      'Overview',
      (p.address || p.district) && 'Location',
      (floorPlans.length > 0) && 'Floor Plans',
      (p.inventories.length > 0 || p.listings.length > 0) && 'Units/Inventory',
      (p.thumbnail || images.length > 0 || parsedImages.length > 0) && 'Gallery',
      (tour360 || video) && 'Video 360°',
      (policy.length > 0) && 'Policy',
      (p.resources.length > 0) && 'Documents',
      'Contact'
    ].filter(Boolean);

    const hiddenSections = [
      !floorPlans.length && 'Floor Plans',
      !(p.inventories.length || p.listings.length) && 'Units/Inventory',
      !(p.thumbnail || images.length || parsedImages.length) && 'Gallery',
      !(tour360 || video) && 'Video 360°',
      !policy.length && 'Policy',
      !p.resources.length && 'Documents'
    ].filter(Boolean);

    console.log(`\n----------------------------------------`);
    console.log(`[PROJECT]: ${p.name}`);
    console.log(`- Slug: /du-an/${p.slug}`);
    console.log(`- Address: ${p.address || [p.district?.name, p.province?.name].filter(Boolean).join(', ') || 'N/A'}`);
    console.log(`- Developer: ${p.developer || 'N/A'}`);
    console.log(`- Thumbnail: ${p.thumbnail ? 'YES' : 'NO'}`);
    console.log(`- Description: ${p.description ? 'YES (' + p.description.slice(0, 60) + '...)' : 'NO'}`);
    console.log(`- Website Status: ${p.website ? p.website.status : 'AUTO-GENERATED FALLBACK MICROSITE'}`);
    console.log(`- Inventory Count: ${p.inventories.length}`);
    console.log(`- Listing Count: ${p.listings.length}`);
    console.log(`- Public Resources Count: ${p.resources.length}`);

    const resourceTypes = p.resources.map(r => r.type);
    console.log(`- Resource Types:`, Array.from(new Set(resourceTypes)));
    console.log(`- 360 Tour URL: ${tour360 ? tour360.url : 'NONE'}`);
    console.log(`- Active Sections (${activeSections.length}): ${activeSections.join(', ')}`);
    console.log(`- Hidden Sections (${hiddenSections.length}): ${hiddenSections.join(', ')}`);
  }
}

main().finally(() => prisma.$disconnect());
