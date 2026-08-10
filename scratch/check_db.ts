import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, slug: true }
  });
  console.log("=== PROJECTS ===");
  console.dir(projects, { depth: null });

  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      unitCode: true,
      title: true,
      block: true,
      floor: true,
      salePrice: true,
      unitStatus: true,
      furnitureStatus: true,
      projectId: true,
      project: { select: { name: true, slug: true } }
    }
  });
  console.log("=== LISTINGS ===");
  console.dir(listings, { depth: null });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
