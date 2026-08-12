import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== CẬP NHẬT CHÍNH XÁC HỌ TÊN ĐẦY ĐỦ VÀ VAI TRÒ ===");

  // 1. Bùi Thị Trúc — ADMIN
  await prisma.user.update({
    where: { email: "buithitruc05@gmail.com" },
    data: { name: "Bùi Thị Trúc", role: "ADMIN" },
  });

  // 2. Phạm Minh Dũng — MANAGER
  await prisma.user.update({
    where: { email: "minhdung50497@gmail.com" },
    data: { name: "Phạm Minh Dũng", role: "MANAGER" },
  });

  // 3. Nguyễn Hiệp — STAFF
  await prisma.user.update({
    where: { email: "hiepstepn87@gmail.com" },
    data: { name: "Nguyễn Hiệp", role: "STAFF" },
  });

  // 4. Trần Thị Mỹ Linh — STAFF
  await prisma.user.update({
    where: { email: "tranthimylinh2003qngai@gmail.com" },
    data: { name: "Trần Thị Mỹ Linh", role: "STAFF" },
  });

  console.log("✅ Đã cập nhật chính xác 100% họ tên đầy đủ và vai trò!");
}

main().finally(() => prisma.$disconnect());
