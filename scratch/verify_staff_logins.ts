import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const accountsToTest = [
  { email: "minhdung50497@gmail.com", pass: "Dung@12345" },
  { email: "hiepstepn87@gmail.com", pass: "Hiep@12345" },
  { email: "tranthimylinh2003qngai@gmail.com", pass: "Linh@12345" },
  { email: "buithitruc05@gmail.com", pass: "123456" },
];

async function main() {
  console.log("=== THỬ NGHIỆM ĐĂNG NHẬP CHO CÁC TÀI KHOẢN ===");

  for (const acc of accountsToTest) {
    const user = await prisma.user.findUnique({
      where: { email: acc.email },
    });

    if (!user) {
      console.log(`❌ KHÔNG TÌM THẤY USER: ${acc.email}`);
      continue;
    }

    if (!user.active) {
      console.log(`❌ TÀI KHOẢN BỊ KHÓA (active = false): ${acc.email}`);
      continue;
    }

    const isMatch = await bcrypt.compare(acc.pass, user.passwordHash);
    console.log(
      `Email: ${acc.email} | Pass gõ thử: ${acc.pass} | Kết quả bcrypt.compare: ${
        isMatch ? "✅ THÀNH CÔNG" : "❌ THẤY THẤT BẠI (SAI MẬT KHẨU)"
      }`
    );
  }
}

main().finally(() => prisma.$disconnect());
