import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runCheck() {
  const websiteResources = await prisma.projectResource.findMany({
    where: { type: "WEBSITE" },
    include: { project: true },
  });

  const infoResources = await prisma.projectResource.findMany({
    where: { type: "GENERAL_INFO" },
    include: { project: true },
  });

  const tour360Resources = await prisma.projectResource.findMany({
    where: { type: "TOUR_360" },
    include: { project: true },
  });

  console.log("================ BÁO CÁO DATABASE SAU KHI MIGRATE ================");
  console.log(`1. Tổng số WEBSITE resources: ${websiteResources.length}`);
  console.log(`2. Tổng số GENERAL_INFO resources: ${infoResources.length}`);
  console.log(`3. Tổng số TOUR_360 resources: ${tour360Resources.length}`);
  console.log("------------------------------------------------------------------");
  console.log("Danh sách chi tiết 10 TOUR_360 resources trong Database:");

  tour360Resources.forEach((res, index) => {
    console.log(
      `${index + 1}. ${res.project ? res.project.name : "[Resource Toàn thành phố (projectId = null)]"}`
    );
    console.log(`   - Tiêu đề: ${res.title}`);
    console.log(`   - URL: ${res.url}`);
  });
}

runCheck()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
