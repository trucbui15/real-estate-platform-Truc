import { prisma } from "../src/lib/prisma";

async function main() {
  const user = await prisma.user.update({
    where: { email: "hiepstepn87@gmail.com" },
    data: { name: "Võ Hoàng Thanh Hiệp" },
  });
  console.log(`✅ Đã cập nhật chính xác họ tên: ${user.name} (${user.email})`);
}

main().finally(() => prisma.$disconnect());
