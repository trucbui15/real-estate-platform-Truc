const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: { website: true, resources: true },
  });
  console.log("ALL PROJECTS:", JSON.stringify(projects.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    isActive: p.isActive,
    website: p.website ? { status: p.website.status } : null,
    resources: p.resources.map(r => ({ id: r.id, title: r.title, type: r.type, url: r.url, isPublic: r.isPublic, isActive: r.isActive }))
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
