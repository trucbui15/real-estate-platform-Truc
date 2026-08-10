import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
  });

  if (!project) throw new Error("Project not found!");

  const harbourItems = await prisma.projectInventory.findMany({
    where: {
      projectId: project.id,
      block: "THE HARBOUR",
    },
    orderBy: { unitCode: "asc" },
  });

  const seaItems = await prisma.projectInventory.findMany({
    where: {
      projectId: project.id,
      block: "THE SEA",
    },
    orderBy: { unitCode: "asc" },
  });

  const publicListingsCount = await prisma.listing.count({
    where: {
      unitCode: {
        in: harbourItems.map((h) => h.unitCode),
      },
    },
  });

  console.log("=== THỐNG KÊ DATABASE SIMONA HEIGHTS ===");
  console.log(`Tòa THE SEA: ${seaItems.length} căn`);
  console.log(`Tòa THE HARBOUR: ${harbourItems.length} căn`);
  console.log(`Số căn Harbour xuất hiện ở /listings (Public Listing): ${publicListingsCount}`);

  console.log("\n=== DANH SÁCH 28 CĂN THE HARBOUR TRONG PROJECTINVENTORY ===");
  console.table(
    harbourItems.map((item, index) => ({
      STT: index + 1,
      unitCode: item.unitCode,
      floor: item.floor,
      salePriceVNĐ: item.salePrice ? item.salePrice.toLocaleString("vi-VN") : "0",
      salePriceTỷ: item.salePrice ? `${(item.salePrice / 1e9).toFixed(3)} tỷ` : "0",
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      area: `${item.area} m²`,
      direction: item.doorDirection,
      unitStatus: item.unitStatus,
    }))
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
