const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function revertSimonaToDraft() {
  console.log("--- REVERTING SIMONA HEIGHTS STATUS TO DRAFT ---");
  try {
    const project = await prisma.project.findUnique({
      where: { slug: "simona-heights" },
      include: { website: true },
    });

    if (!project || !project.website) {
      console.log("Project Simona Heights or website record not found.");
      return;
    }

    // Set status = DRAFT while keeping draft* and published* fields intact
    const updated = await prisma.projectWebsite.update({
      where: { id: project.website.id },
      data: {
        status: "DRAFT",
      },
    });

    console.log("Simona Heights ProjectWebsite status reverted to:", updated.status);

    // Hide ProjectResource from public
    await prisma.projectResource.updateMany({
      where: {
        projectId: project.id,
        type: "WEBSITE",
        url: "/du-an/simona-heights",
      },
      data: {
        isPublic: false,
      },
    });
    console.log("Simona Heights ProjectResource set isPublic: false.");

  } catch (err) {
    console.error("Lỗi khi chuyển Simona Heights về DRAFT:", err);
  } finally {
    await prisma.$disconnect();
  }
}

revertSimonaToDraft();
