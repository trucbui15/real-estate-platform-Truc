const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { slug: { contains: "altara" } },
        { name: { contains: "Altara" } },
        { slug: { contains: "simona" } },
        { name: { contains: "Simona" } },
      ]
    },
    include: {
      website: true,
      resources: true,
      inventories: true,
      listings: true,
    }
  });

  console.log("PROJECTS FOUND:", JSON.stringify(projects.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    isActive: p.isActive,
    developer: p.developer,
    address: p.address,
    thumbnail: p.thumbnail,
    images: p.images,
    website: p.website ? {
      id: p.website.id,
      status: p.website.status,
      publishedMetaTitle: p.website.publishedMetaTitle,
      publishedMetaDescription: p.website.publishedMetaDescription,
      hasPublishedSections: !!p.website.publishedSectionsConfig,
      hasPublishedContent: !!p.website.publishedContentJson,
      hasDraftSections: !!p.website.draftSectionsConfig,
      hasDraftContent: !!p.website.draftContentJson,
    } : null,
    resourcesCount: p.resources.length,
    inventoriesCount: p.inventories.length,
    listingsCount: p.listings.length,
    resources: p.resources,
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
