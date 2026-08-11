const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
  });

  if (!project) {
    console.error("Không tìm thấy dự án simona-heights-quy-nhon trong database!");
    return;
  }

  console.log(`Bắt đầu Import đầy đủ Bảng Hàng cho dự án: ${project.name} (ID: ${project.id})`);

  // 1. TÒA THE SEA (15 căn)
  const seaUnits = [
    { unitCode: "S.12.05", block: "THE SEA", floor: "12", salePrice: 4370000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DA_BAN" },
    { unitCode: "S.12A.05", block: "THE SEA", floor: "12A", salePrice: 4320000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.14.05", block: "THE SEA", floor: "14", salePrice: 4470000000, bedrooms: 3, bathrooms: 2, area: 87.54, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.15.05", block: "THE SEA", floor: "15", salePrice: 4600000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.16.05", block: "THE SEA", floor: "16", salePrice: 4610000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.16.14", block: "THE SEA", floor: "16", salePrice: 3900000000, bedrooms: 2, bathrooms: 2, area: 87.54, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.17.05", block: "THE SEA", floor: "17", salePrice: 4610000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.18.05", block: "THE SEA", floor: "18", salePrice: 4820000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.18.14", block: "THE SEA", floor: "18", salePrice: 4070000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.19.05", block: "THE SEA", floor: "19", salePrice: 4820000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.20.05", block: "THE SEA", floor: "20", salePrice: 4820000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.23.05", block: "THE SEA", floor: "23", salePrice: 4860000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.24.05", block: "THE SEA", floor: "24", salePrice: 4910000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.25.05", block: "THE SEA", floor: "25", salePrice: 4960000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "S.16.09", block: "THE SEA", floor: "16", salePrice: 5078000000, bedrooms: 3, bathrooms: 3, area: 86.95, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
  ];

  // 2. TÒA THE HARBOUR (25 căn)
  const harbourUnits = [
    { unitCode: "H.03.01", block: "THE HARBOUR", floor: "03", salePrice: 2890000000, bedrooms: 1, bathrooms: 1, area: 55.28, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.3A.18", block: "THE HARBOUR", floor: "3A", salePrice: 2430000000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.05.03", block: "THE HARBOUR", floor: "05", salePrice: 4540000000, bedrooms: 3, bathrooms: 3, area: 86.64, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.06.03", block: "THE HARBOUR", floor: "06", salePrice: 4540000000, bedrooms: 3, bathrooms: 3, area: 88.64, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.08.18", block: "THE HARBOUR", floor: "08", salePrice: 2430000000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.07", block: "THE HARBOUR", floor: "11", salePrice: 3370000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.08", block: "THE HARBOUR", floor: "11", salePrice: 3370000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.12", block: "THE HARBOUR", floor: "11", salePrice: 3890000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.14", block: "THE HARBOUR", floor: "11", salePrice: 3890000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.15", block: "THE HARBOUR", floor: "11", salePrice: 4830000000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.16", block: "THE HARBOUR", floor: "11", salePrice: 4430000000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.17", block: "THE HARBOUR", floor: "11", salePrice: 3220000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.11.18", block: "THE HARBOUR", floor: "11", salePrice: 2470000000, bedrooms: 1, bathrooms: 1, area: 44.88, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.12A.11", block: "THE HARBOUR", floor: "12A", salePrice: 3900000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.12A.12", block: "THE HARBOUR", floor: "12A", salePrice: 3900000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.12A.14", block: "THE HARBOUR", floor: "12A", salePrice: 3900000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.12A.17", block: "THE HARBOUR", floor: "12A", salePrice: 3180000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.17.07", block: "THE HARBOUR", floor: "17", salePrice: 3480000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.17.08", block: "THE HARBOUR", floor: "17", salePrice: 3480000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.20.07", block: "THE HARBOUR", floor: "20", salePrice: 3650000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.20.11", block: "THE HARBOUR", floor: "20", salePrice: 4270000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.20.12", block: "THE HARBOUR", floor: "20", salePrice: 4270000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.20.14", block: "THE HARBOUR", floor: "20", salePrice: 4270000000, bedrooms: 2, bathrooms: 2, area: 64.65, doorDirection: "TAY_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.20.15", block: "THE HARBOUR", floor: "20", salePrice: 4270000000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "DONG_BAC", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
    { unitCode: "H.20.16", block: "THE HARBOUR", floor: "20", salePrice: 4890000000, bedrooms: 3, bathrooms: 2, area: 86.95, doorDirection: "TAY_NAM", furnitureStatus: "FULL_NOI_THAT", unitStatus: "DANG_BAN" },
  ];

  const allUnits = [...seaUnits, ...harbourUnits];
  let imported = 0;

  for (const u of allUnits) {
    await prisma.projectInventory.upsert({
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
    imported++;
  }

  console.log(`Đã Import THÀNH CÔNG ${imported} căn Simona Heights (Tòa THE SEA: ${seaUnits.length} căn, Tòa THE HARBOUR: ${harbourUnits.length} căn) vào cơ sở dữ liệu!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
