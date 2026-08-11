const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.projectInventory.findMany({
    take: 5,
    select: { unitCode: true, bedrooms: true, images: true }
  });

  console.log('--- SAMPLE UNITS WITH IMAGES ---');
  units.forEach(u => {
    console.log(`Unit: ${u.unitCode} (${u.bedrooms} PN) -> Images: ${u.images}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
