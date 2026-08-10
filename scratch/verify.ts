import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const totalProjects = await prisma.project.count();
  const totalResources = await prisma.projectResource.count();
  const tour360Resources = await prisma.projectResource.findMany({
    where: { type: "TOUR_360" },
    include: { project: { select: { name: true, slug: true } } },
  });

  console.log("========== KẾT QUẢ DATABASE TRUY VẤN THỰC TẾ ==========");
  console.log(`- Tổng số Dự án trong DB: ${totalProjects}`);
  console.log(`- Tổng số ProjectResource trong DB: ${totalResources}`);
  console.log(`- Số lượng tài liệu loại TOUR_360 trong DB: ${tour360Resources.length}`);
  console.log("---------------------------------------------------------");
  console.log("Danh sách chi tiết 7 link 360° trong PostgreSQL:");

  tour360Resources.forEach((res, index) => {
    console.log(
      `${index + 1}. [${res.project?.name || "Khu vực toàn thành phố (projectId = null)"}]`
    );
    console.log(`   - Tiêu đề: ${res.title}`);
    console.log(`   - URL thực tế: ${res.url}`);
    console.log(`   - Trạng thái: Public=${res.isPublic}, Active=${res.isActive}`);
  });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
