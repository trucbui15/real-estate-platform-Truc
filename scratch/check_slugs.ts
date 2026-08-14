import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/utils";

async function main() {
  const listings = await prisma.listing.findMany();
  console.log(`Found ${listings.length} total listings in DB:`);
  for (const l of listings) {
    console.log({
      id: l.id,
      title: l.title,
      unitCode: l.unitCode,
      productCode: l.productCode,
      currentSlug: l.slug,
      suggestedSlug: slugify(l.title) + "-" + slugify(l.productCode || l.unitCode),
    });
  }
}

main().finally(() => prisma.$disconnect());
