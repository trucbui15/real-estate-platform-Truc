import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
  });

  if (!project) throw new Error("Project Simona Heights not found!");

  // Find unit S.12A.05 in ProjectInventory
  const unit = await prisma.projectInventory.findUnique({
    where: {
      projectId_unitCode: {
        projectId: project.id,
        unitCode: "S.12A.05",
      },
    },
  });

  if (!unit) {
    console.log("Unit S.12A.05 not found in ProjectInventory!");
    return;
  }

  console.log("=== TRẠNG THÁI BAN ĐẦU CỦA S.12A.05 ===");
  console.log(`UnitCode: ${unit.unitCode}, Block: ${unit.block}, Images: ${unit.images}`);

  // Test updating images array
  const testImages = ["/uploads/sample_floorplan_S12A05.jpg"];
  const updated = await prisma.projectInventory.update({
    where: { id: unit.id },
    data: {
      images: JSON.stringify(testImages),
    },
  });

  console.log("\n=== CẬP NHẬT THÀNH CÔNG THỬ NGHIỆM ẢNH MẶT BẰNG S.12A.05 ===");
  console.log(`UnitCode: ${updated.unitCode}, Block: ${updated.block}, Images: ${updated.images}`);

  // Check if public listings at /listings are affected
  const publicListingCount = await prisma.listing.count({
    where: { unitCode: "S.12A.05" },
  });
  console.log(`Số bài đăng public của S.12A.05 ở /listings: ${publicListingCount} (Đảm bảo 0 - hoàn toàn tách biệt)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
