import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/utils";

async function main() {
  console.log("Updating all listing slugs to be clean and use productCode...");
  const listings = await prisma.listing.findMany();

  for (const l of listings) {
    const code = l.productCode || l.unitCode;
    const cleanSlug = slugify(l.title) + "-" + slugify(code);
    await prisma.listing.update({
      where: { id: l.id },
      data: { slug: cleanSlug },
    });
    console.log(`Updated listing ${l.id}: ${l.slug} -> ${cleanSlug}`);
  }

  console.log("✓ All listing slugs updated cleanly!");
}

main().finally(() => prisma.$disconnect());
