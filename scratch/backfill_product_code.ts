import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Backfilling productCode for existing listings...");
  const listings = await prisma.listing.findMany({
    where: { productCode: null },
  });

  console.log(`Found ${listings.length} listings with missing productCode.`);

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    // Generate productCode e.g. SP-1001, SP-1002 or based on index / unitCode
    const rand = Math.floor(1000 + Math.random() * 9000);
    const productCode = `SP-${rand}${i + 1}`;
    await prisma.listing.update({
      where: { id: l.id },
      data: { productCode },
    });
    console.log(`Updated listing ${l.unitCode} -> productCode: ${productCode}`);
  }

  console.log("✓ Backfill completed successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
