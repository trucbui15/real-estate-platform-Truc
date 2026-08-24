import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      website: true,
      resources: {
        where: {
          isActive: true,
          isPublic: true,
        },
      },
      inventories: true,
      listings: {
        where: {
          unitStatus: {
            in: ['DANG_BAN', 'DANG_CHO_THUE'],
          },
        },
      },
    },
  });

  console.log(`TOTAL_PROJECTS:${projects.length}`);

  const reportData = [];

  for (const p of projects) {
    const ws = p.website;
    const isPublished = ws?.status === 'PUBLISHED';
    const isDraft = ws?.status === 'DRAFT';
    const hasWebsite = !!ws;

    let contentJson: any = null;
    if (ws) {
      const jsonStr = ws.publishedContentJson || ws.draftContentJson;
      if (jsonStr) {
        try {
          contentJson = JSON.parse(jsonStr);
        } catch (e) {
          contentJson = null;
        }
      }
    }

    const hasHero = !!(contentJson?.hero?.title || contentJson?.hero?.bgImage || p.thumbnail);
    const hasHeroImage = !!(contentJson?.hero?.bgImage || p.thumbnail);

    const hasOverview = !!(contentJson?.overview || p.description);
    const hasLocation = !!(contentJson?.location);
    const hasAmenities = !!(contentJson?.amenities?.items?.length || contentJson?.amenities?.description);
    const hasFloorPlan = !!(contentJson?.floorPlan || contentJson?.masterPlan);
    const hasProgress = !!(contentJson?.progress);
    const hasGallery = !!(contentJson?.gallery?.length || p.images);

    const resourceTypes = p.resources.map(r => r.type);
    const has360 = resourceTypes.includes('TOUR_360') || !!contentJson?.virtualTourUrl;
    const hasDocs = p.resources.length > 0;

    const inventoryCount = p.inventories.length;
    const listingCount = p.listings.length;

    let classification = 'INSUFFICIENT';
    if (hasWebsite && (contentJson?.hero || contentJson?.overview) && (hasHeroImage || hasGallery)) {
      if (hasOverview && (hasLocation || hasAmenities || hasFloorPlan || hasGallery)) {
        classification = 'READY';
      } else {
        classification = 'PARTIAL';
      }
    } else if (p.thumbnail || p.description || p.resources.length > 0 || inventoryCount > 0 || listingCount > 0) {
      classification = 'PARTIAL';
    }

    reportData.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      isActive: p.isActive,
      hasWebsite,
      websiteStatus: ws?.status || 'NO_WEBSITE',
      classification,
      hasHeroImage,
      hasHero,
      hasOverview,
      hasLocation,
      hasAmenities,
      hasFloorPlan,
      hasProgress,
      hasGallery,
      inventoryCount,
      listingCount,
      has360,
      resourceCount: p.resources.length,
      resourceTypes: Array.from(new Set(resourceTypes)),
      hasDraftJson: !!ws?.draftContentJson,
      hasPublishedJson: !!ws?.publishedContentJson,
    });
  }

  console.log(JSON.stringify(reportData, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
