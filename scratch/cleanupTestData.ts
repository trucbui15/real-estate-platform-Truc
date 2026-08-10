import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  // 1. Tìm và xóa dự án rác test "Simona height" (developer: "aaaa")
  const dummySimona = await prisma.project.findFirst({
    where: {
      OR: [
        { name: { contains: "Simona height", mode: "insensitive" } },
        { developer: "aaaa" },
      ],
      NOT: { slug: "simona-heights-quy-nhon" },
    },
  });

  if (dummySimona) {
    console.log(`- Xóa dự án rác test: ${dummySimona.name} (${dummySimona.id})`);
    await prisma.project.delete({ where: { id: dummySimona.id } });
  }

  // 2. Tìm và xóa dự án trùng "Altara Residences Quy Nhơn" với chủ đầu tư sai "Hưng Thịnh Land"
  const duplicateAltara = await prisma.project.findFirst({
    where: {
      name: { contains: "Altara", mode: "insensitive" },
      developer: { contains: "Hưng Thịnh", mode: "insensitive" },
    },
  });

  if (duplicateAltara) {
    console.log(`- Xóa dự án Altara trùng lặp sai CĐT: ${duplicateAltara.name} (${duplicateAltara.id})`);
    await prisma.project.delete({ where: { id: duplicateAltara.id } });
  }

  console.log("Clean up hoàn tất!");
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
