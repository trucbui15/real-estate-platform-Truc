import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const newHash = await bcrypt.hash("Truc@010503", 10);
  const user = await prisma.user.update({
    where: { email: "buithitruc05@gmail.com" },
    data: {
      passwordHash: newHash,
      role: "ADMIN",
      active: true,
    },
  });
  const isVerified = await bcrypt.compare("Truc@010503", user.passwordHash);
  console.log(`✅ Đã cập nhật mật khẩu ADMIN buithitruc05@gmail.com thành: Truc@010503 (Xác minh: ${isVerified ? "KHỚP 100%" : "LỖI"})`);
}

main().finally(() => prisma.$disconnect());
