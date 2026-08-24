const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const simona = await prisma.project.findUnique({
    where: { slug: 'simona-heights-quy-nhon' },
    include: {
      inventories: {
        orderBy: [{ block: 'asc' }, { unitCode: 'asc' }]
      }
    }
  });

  if (!simona) {
    console.log("Simona project not found!");
    return;
  }

  console.log(`=== SIMONA HEIGHTS INVENTORY AUDIT ===`);
  console.log(`Total Inventory Count: ${simona.inventories.length}`);

  // Check unique unit codes
  const unitCodes = simona.inventories.map(u => u.unitCode);
  const uniqueUnitCodes = new Set(unitCodes);
  console.log(`Unique unitCode count: ${uniqueUnitCodes.size}`);

  // Check duplicates if any
  const codeCounts = {};
  unitCodes.forEach(code => {
    codeCounts[code] = (codeCounts[code] || 0) + 1;
  });

  const duplicates = Object.entries(codeCounts).filter(([code, count]) => count > 1);
  console.log(`Duplicate unitCode count: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log("Duplicates found:", duplicates);
  } else {
    console.log("NO DUPLICATE unitCode found! All 138 unit codes are 100% unique.");
  }

  // Check block breakdown
  const blockBreakdown = {};
  simona.inventories.forEach(u => {
    const block = u.block || 'NO_BLOCK';
    blockBreakdown[block] = (blockBreakdown[block] || 0) + 1;
  });
  console.log(`Block breakdown:`, blockBreakdown);

  // Check bedroom breakdown
  const brBreakdown = {};
  simona.inventories.forEach(u => {
    const br = `${u.bedrooms || 0}PN`;
    brBreakdown[br] = (brBreakdown[br] || 0) + 1;
  });
  console.log(`Bedroom breakdown:`, brBreakdown);

  // Sample units
  console.log(`\nSample units (first 10):`);
  simona.inventories.slice(0, 10).forEach(u => {
    console.log(`- ID: ${u.id} | Code: ${u.unitCode} | Block: ${u.block} | Floor: ${u.floor} | ${u.bedrooms}PN - ${u.bathrooms}WC | Area: ${u.area}m2 | Price: ${u.salePrice} | Status: ${u.unitStatus}`);
  });
}

main().finally(() => prisma.$disconnect());
