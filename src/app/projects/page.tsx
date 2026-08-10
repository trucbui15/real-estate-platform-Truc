import { prisma } from "@/lib/prisma";
import ProjectsClient from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rawProjects = await prisma.project.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      inventories: {
        where: { unitStatus: "DANG_BAN" },
        select: { id: true },
      },
      listings: {
        select: { id: true, transactionType: true, unitStatus: true },
      },
    },
  });

  const projects = rawProjects.map((p) => {
    // Parse cover image from thumbnail or images JSON
    let coverImg = p.thumbnail || null;
    if (!coverImg && p.images) {
      try {
        const arr = JSON.parse(p.images);
        if (Array.isArray(arr) && arr.length > 0) coverImg = arr[0];
      } catch (e) {}
    }

    const inventoryCount = p.inventories.length;
    const saleCount = p.listings.filter(
      (l) => l.transactionType === "SALE" && (l.unitStatus === "DANG_BAN" || l.unitStatus === "CHO_DUYET")
    ).length;
    const rentCount = p.listings.filter(
      (l) => l.transactionType === "RENT" && (l.unitStatus === "DANG_BAN" || l.unitStatus === "DANG_CHO_THUE" || l.unitStatus === "CHO_DUYET")
    ).length;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      developer: p.developer,
      address: p.address,
      bannerImage: coverImg,
      inventoryCount,
      saleCount,
      rentCount,
    };
  });

  return <ProjectsClient projects={projects} />;
}
