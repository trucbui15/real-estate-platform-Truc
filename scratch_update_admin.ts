import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Trúc: MD_T01
  await prisma.user.updateMany({
    where: { email: "buithitruc05@gmail.com" },
    data: { referralCode: "MD_T01" },
  });

  // 2. Linh: MD_L02
  await prisma.user.updateMany({
    where: { email: "tranthimylinh2003qngai@gmail.com" },
    data: { referralCode: "MD_L02" },
  });

  // 3. Hiệp: MD_H03
  await prisma.user.updateMany({
    where: { email: "hiepstepn87@gmail.com" },
    data: { referralCode: "MD_H03" },
  });

  // 4. Dũng: MD_D04
  await prisma.user.updateMany({
    where: { email: "minhdung50497@gmail.com" },
    data: { referralCode: "MD_D04" },
  });

  console.log("Updated all 4 user referral codes successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
