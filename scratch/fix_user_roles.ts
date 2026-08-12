import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== CẬP NHẬT LẠI VAI TRÒ ADMIN NGUYÊN BẢN ===");

  // Set Minh Dũng to ADMIN
  const md = await prisma.user.update({
    where: { email: "minhdung50497@gmail.com" },
    data: { role: "ADMIN" },
  });
  console.log(`✅ Đã đặt lại ${md.email} làm ADMIN (Quản trị hệ thống)`);

  // Ensure Bùi Thị Trúc is ADMIN
  const tr = await prisma.user.update({
    where: { email: "buithitruc05@gmail.com" },
    data: { role: "ADMIN" },
  });
  console.log(`✅ Đã giữ nguyên ${tr.email} làm ADMIN (Quản trị hệ thống)`);
}

main().finally(() => prisma.$disconnect());
