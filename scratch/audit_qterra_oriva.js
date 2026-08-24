const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectProject(slug) {
  const p = await prisma.project.findUnique({
    where: { slug },
    include: {
      website: true,
      resources: true,
      inventories: true,
      listings: true,
      province: true,
      district: true
    }
  });

  console.log(`\n========================================`);
  console.log(`[FULL DB FIELD INSPECTION]: ${slug}`);
  if (!p) {
    console.log("NOT FOUND");
    return;
  }

  console.log({
    id: p.id,
    name: p.name,
    slug: p.slug,
    developer: p.developer,
    description: p.description,
    address: p.address,
    provinceId: p.provinceId,
    provinceName: p.province?.name,
    districtId: p.districtId,
    districtName: p.district?.name,
    thumbnail: p.thumbnail,
    images: p.images,
    isActive: p.isActive,
    featured: p.featured,
    website: p.website,
    resourcesCount: p.resources.length,
    inventoriesCount: p.inventories.length,
    listingsCount: p.listings.length
  });
}

async function main() {
  await inspectProject('q-terra-q1-tower');
  await inspectProject('oriva-bay-quy-nhon');
}

main().finally(() => prisma.$disconnect());
