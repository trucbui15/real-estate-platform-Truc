import { prisma } from "../src/lib/prisma";

async function main() {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      unitStatus: true,
      createdAt: true,
    },
  });

  console.log("=== ALL LISTINGS IN DB ===");
  console.log("Total:", listings.length);
  console.table(listings);
}

main().finally(() => prisma.$disconnect());
