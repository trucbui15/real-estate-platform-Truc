import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
  });

  if (!project) {
    throw new Error("Không tìm thấy dự án Simona Heights Quy Nhơn trong database!");
  }

  console.log(`Bắt đầu import Bảng Hàng Tòa THE HARBOUR cho dự án: ${project.name} (ID: ${project.id})`);

  const harbourUnits = [
    { unitCode: "H.03.01", floor: "03", salePrice: 2_890_000_000, bedrooms: 1, bathrooms: 1, area: 55.28, doorDirection: "DONG_NAM" as const },
    { unitCode: "H.3A.18", floor: "3A", salePrice: 2_430_000_000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.05.03", floor: "05", salePrice: 4_540_000_000, bedrooms: 3, bathrooms: 3, area: 86.64, doorDirection: "DONG_NAM" as const },
    { unitCode: "H.06.03", floor: "06", salePrice: 4_540_000_000, bedrooms: 3, bathrooms: 3, area: 88.64, doorDirection: "DONG_NAM" as const },
    { unitCode: "H.08.18", floor: "08", salePrice: 2_430_000_000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.11.07", floor: "11", salePrice: 3_370_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC" as const },
    { unitCode: "H.11.08", floor: "11", salePrice: 3_370_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_NAM" as const },
    { unitCode: "H.11.12", floor: "11", salePrice: 3_890_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.11.14", floor: "11", salePrice: 3_890_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.11.15", floor: "11", salePrice: 4_830_000_000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.11.16", floor: "11", salePrice: 4_430_000_000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.11.17", floor: "11", salePrice: 3_220_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.11.18", floor: "11", salePrice: 2_470_000_000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.12A.11", floor: "12A", salePrice: 3_900_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.12A.12", floor: "12A", salePrice: 3_900_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.12A.14", floor: "12A", salePrice: 3_900_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.12A.17", floor: "12A", salePrice: 3_180_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.17.07", floor: "17", salePrice: 3_480_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC" as const },
    { unitCode: "H.17.08", floor: "17", salePrice: 3_480_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC" as const },
    { unitCode: "H.20.07", floor: "20", salePrice: 3_650_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC" as const },
    { unitCode: "H.20.11", floor: "20", salePrice: 4_270_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.20.12", floor: "20", salePrice: 4_270_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.20.14", floor: "20", salePrice: 4_270_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC" as const },
    { unitCode: "H.20.15", floor: "20", salePrice: 4_270_000_000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "DONG_BAC" as const },
    { unitCode: "H.20.16", floor: "20", salePrice: 4_270_000_000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.20.17", floor: "20", salePrice: 4_270_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.20.18", floor: "20", salePrice: 4_270_000_000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM" as const },
    { unitCode: "H.20.08", floor: "20", salePrice: 3_649_000_000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC" as const },
  ];

  let count = 0;

  for (const u of harbourUnits) {
    const item = await prisma.projectInventory.upsert({
      where: {
        projectId_unitCode: {
          projectId: project.id,
          unitCode: u.unitCode,
        },
      },
      update: {
        block: "THE HARBOUR",
        floor: u.floor,
        salePrice: u.salePrice,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        area: u.area,
        doorDirection: u.doorDirection,
        furnitureStatus: "FULL_NOI_THAT",
        unitStatus: "DANG_BAN",
      },
      create: {
        projectId: project.id,
        unitCode: u.unitCode,
        block: "THE HARBOUR",
        floor: u.floor,
        salePrice: u.salePrice,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        area: u.area,
        doorDirection: u.doorDirection,
        furnitureStatus: "FULL_NOI_THAT",
        unitStatus: "DANG_BAN",
      },
    });

    console.log(`[SUCCESS] ${item.unitCode} - Tòa: ${item.block} - Tầng: ${item.floor} - Giá: ${(item.salePrice! / 1e9).toFixed(3)} tỷ - Status: ${item.unitStatus}`);
    count++;
  }

  console.log(`\nImport hoàn tất! Đã import ${count} căn Tòa THE HARBOUR vào ProjectInventory.`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
