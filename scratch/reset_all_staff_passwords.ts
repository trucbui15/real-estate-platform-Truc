import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const accountPasswords = [
  { email: "minhdung50497@gmail.com", pass: "Dung@12345" },
  { email: "hiepstepn87@gmail.com", pass: "Hiep@12345" },
  { email: "tranthimylinh2003qngai@gmail.com", pass: "Linh@12345" },
  { email: "buithitruc05@gmail.com", pass: "123456" },
];

async function main() {
  console.log("=== ĐẶT LẠI MẬT KHẨU CHUẨN XÁC VÀ BẢO MẬT CHO 4 CHỦ TÀI KHOẢN ===");

  for (const item of accountPasswords) {
    const newHash = await bcrypt.hash(item.pass, 10);
    const updatedUser = await prisma.user.update({
      where: { email: item.email },
      data: {
        passwordHash: newHash,
        active: true,
      },
    });

    const isVerified = await bcrypt.compare(item.pass, updatedUser.passwordHash);
    console.log(
      `✅ Email: ${item.email} | Mật khẩu chuẩn: "${item.pass}" | Xác minh Bcrypt: ${
        isVerified ? "KHỚP 100%" : "LỖI"
      }`
    );
  }
}

main().finally(() => prisma.$disconnect());
