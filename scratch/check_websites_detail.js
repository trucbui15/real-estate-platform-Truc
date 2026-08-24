const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const websites = await prisma.projectWebsite.findMany({
    include: { project: true }
  });
  console.log(`Found ${websites.length} ProjectWebsite records:`);
  websites.forEach(w => {
    console.log(`- Project: ${w.project.name} (slug: ${w.project.slug}), Status: ${w.status}, PublishedAt: ${w.publishedAt}`);
  });

  const websiteResources = await prisma.projectResource.findMany({
    where: { type: "WEBSITE" },
    include: { project: true }
  });
  console.log(`\nFound ${websiteResources.length} ProjectResource WEBSITE records:`);
  websiteResources.forEach(r => {
    console.log(`- Resource Title: "${r.title}", Project: ${r.project?.name} (slug: ${r.project?.slug}), URL: "${r.url}"`);
  });
}

main().finally(() => prisma.$disconnect());
