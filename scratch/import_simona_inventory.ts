import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find project Simona Heights Quy Nhơn
  const project = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
  });

  if (!project) {
    throw new Error("Không tìm thấy dự án Simona Heights Quy Nhơn trong database!");
  }

  console.log(`Bắt đầu import Bảng Hàng cho dự án: ${project.name} (ID: ${project.id})`);

  // 15 căn đã xác minh chính xác từ ảnh bảng hàng The Sea
  const seaUnits = [
    {
      unitCode: "S.12.05",
      block: "THE SEA",
      floor: "12",
      salePrice: 4_370_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DA_BAN" as const,
    },
    {
      unitCode: "S.12A.05",
      block: "THE SEA",
      floor: "12A",
      salePrice: 4_320_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.14.05",
      block: "THE SEA",
      floor: "14",
      salePrice: 4_470_000_000,
      bedrooms: 3,
      bathrooms: 2,
      area: 87.54,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.15.05",
      block: "THE SEA",
      floor: "15",
      salePrice: 4_600_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.16.05",
      block: "THE SEA",
      floor: "16",
      salePrice: 4_610_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.16.14",
      block: "THE SEA",
      floor: "16",
      salePrice: 3_900_000_000,
      bedrooms: 2,
      bathrooms: 2,
      area: 87.54,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.17.05",
      block: "THE SEA",
      floor: "17",
      salePrice: 4_610_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.18.05",
      block: "THE SEA",
      floor: "18",
      salePrice: 4_820_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.18.14",
      block: "THE SEA",
      floor: "18",
      salePrice: 4_070_000_000,
      bedrooms: 2,
      bathrooms: 2,
      area: 64.65,
      doorDirection: "TAY_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.19.05",
      block: "THE SEA",
      floor: "19",
      salePrice: 4_820_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.20.05",
      block: "THE SEA",
      floor: "20",
      salePrice: 4_820_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.23.05",
      block: "THE SEA",
      floor: "23",
      salePrice: 4_860_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.24.05",
      block: "THE SEA",
      floor: "24",
      salePrice: 4_910_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.25.05",
      block: "THE SEA",
      floor: "25",
      salePrice: 4_960_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
    {
      unitCode: "S.16.09",
      block: "THE SEA",
      floor: "16",
      salePrice: 5_078_000_000,
      bedrooms: 3,
      bathrooms: 3,
      area: 86.95,
      doorDirection: "TAY_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      unitStatus: "DANG_BAN" as const,
    },
  ];

  let successCount = 0;

  for (const u of seaUnits) {
    const res = await prisma.projectInventory.upsert({
      where: {
        projectId_unitCode: {
          projectId: project.id,
          unitCode: u.unitCode,
        },
      },
      update: {
        block: u.block,
        floor: u.floor,
        salePrice: u.salePrice,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        area: u.area,
        doorDirection: u.doorDirection,
        furnitureStatus: u.furnitureStatus,
        unitStatus: u.unitStatus,
      },
      create: {
        projectId: project.id,
        unitCode: u.unitCode,
        block: u.block,
        floor: u.floor,
        salePrice: u.salePrice,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        area: u.area,
        doorDirection: u.doorDirection,
        furnitureStatus: u.furnitureStatus,
        unitStatus: u.unitStatus,
      },
    });
    console.log(`[SUCCESS] ${res.unitCode} - Tòa: ${res.block} - Tầng: ${res.floor} - Giá: ${(res.salePrice! / 1e9).toFixed(3)} tỷ - Trạng thái: ${res.unitStatus}`);
    successCount++;
  }

  console.log(`\nImport hoàn tất! Tổng cộng: ${successCount} căn Tòa THE SEA vào Bảng Hàng dự án.`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
