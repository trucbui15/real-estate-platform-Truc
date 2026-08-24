const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      website: true,
      resources: { where: { isActive: true, isPublic: true } },
      inventories: true,
      listings: { where: { unitStatus: { in: ['DANG_BAN', 'DANG_CHO_THUE'] } } },
      province: true,
      district: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`=== FINAL COMPREHENSIVE AUDIT OF ALL ${projects.length} PROJECTS ===\n`);

  const summaryList = [];

  for (const p of projects) {
    const ws = p.website;
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

    const missingData = [
      !p.address && 'Địa chỉ',
      !p.developer && 'Chủ đầu tư',
      !p.description && 'Mô tả chi tiết',
      !floorPlans.length && 'Sơ đồ mặt bằng',
      !p.inventories.length && 'Bảng hàng inventory',
      !p.listings.length && 'BĐS rao bán listing',
      !tour360 && 'Virtual Tour 360°',
      !policy.length && 'Chính sách bán hàng',
      !p.resources.length && 'Bộ tài liệu PDF/Drive'
    ].filter(Boolean);

    let classification = 'INSUFFICIENT';
    if (ws && ws.status === 'PUBLISHED') {
      classification = 'MASTER';
    } else if (p.inventories.length > 0 || p.listings.length > 0 || p.resources.length >= 7) {
      classification = 'AUTO-GENERATED READY';
    } else if (p.resources.length > 0 || p.thumbnail) {
      classification = 'AUTO-GENERATED PARTIAL';
    }

    summaryList.push({
      name: p.name,
      slug: p.slug,
      micrositeStatus: ws ? (ws.status === 'PUBLISHED' ? 'LIVE (CURATED)' : 'DRAFT') : 'LIVE (AUTO-GENERATED)',
      websiteStatus: ws ? ws.status : 'NO_WEBSITE',
      classification,
      inventoryCount: p.inventories.length,
      listingCount: p.listings.length,
      resourceCount: p.resources.length,
      has360: !!tour360,
      activeSectionsCount: activeSections.length,
      activeSections: activeSections.join(', '),
      missingData: missingData.join(', ') || 'Không thiếu'
    });
  }

  console.log(JSON.stringify(summaryList, null, 2));
}

main().finally(() => prisma.$disconnect());
