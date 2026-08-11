const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inventoryCount = await prisma.projectInventory.count();
  console.log('Total ProjectInventory in DB:', inventoryCount);

  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: { inventories: true, listings: true }
      }
    }
  });

  projects.forEach((p) => {
    console.log(`Project: "${p.name}" (slug: ${p.slug})`);
    console.log(`   Inventories count: ${p._count.inventories}`);
    console.log(`   Listings count: ${p._count.listings}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
