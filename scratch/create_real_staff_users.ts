import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const staffUsers = [
  {
    name: "Trần Thị Mỹ Linh",
    email: "tranthimylinh2003qngai@gmail.com",
    passwordRaw: "Linh@12345",
    role: "STAFF",
  },
  {
    name: "Nguyễn Hiệp",
    email: "hiepstepn87@gmail.com",
    passwordRaw: "Hiep@12345",
    role: "STAFF",
  },
  {
    name: "Minh Dũng",
    email: "minhdung50497@gmail.com",
    passwordRaw: "Dung@12345",
    role: "STAFF",
  },
];

async function main() {
  console.log("=== BẮT ĐẦU KHỞI TẠO TÀI KHOẢN NHÂN VIÊN THẬT VÀO DATABASE ===");
  for (const s of staffUsers) {
    const hash = await bcrypt.hash(s.passwordRaw, 10);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        passwordHash: hash,
        role: "STAFF" as any,
        active: true,
      },
      create: {
        name: s.name,
        email: s.email,
        passwordHash: hash,
        role: "STAFF" as any,
        active: true,
      },
    });
    console.log(`✅ Đã cập nhật thành công tài khoản: ${user.email} (Quyền: ${user.role})`);
  }
}

main().finally(() => prisma.$disconnect());
