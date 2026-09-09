import { prisma } from "@/lib/prisma";
import ProjectsClient from "./ProjectsClient";

import { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dự Án Bất Động Sản Quy Nhơn | Minh Dũng Land",
  description: "Tổng hợp các dự án chung cư, căn hộ cao cấp, khu đô thị và đất nền trọng điểm tại Quy Nhơn, Bình Định.",
  alternates: {
    canonical: `${SITE_URL}/projects`,
  },
  openGraph: {
    title: "Dự Án Bất Động Sản Quy Nhơn | Minh Dũng Land",
    description: "Tổng hợp các dự án chung cư, căn hộ cao cấp, khu đô thị và đất nền trọng điểm tại Quy Nhơn, Bình Định.",
    url: `${SITE_URL}/projects`,
  },
};

export default async function ProjectsPage() {
  let rawProjects: any[] = [];
  try {
    rawProjects = await prisma.project.findMany({
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
  } catch (err) {
    console.error("Database query error in projects page:", err);
  }

  const projects = rawProjects.map((p) => {
    // Parse cover image from thumbnail or images JSON
    let coverImg = p.thumbnail || null;
    if (!coverImg && p.images) {
      try {
        const arr = JSON.parse(p.images);
        if (Array.isArray(arr) && arr.length > 0) coverImg = arr[0];
      } catch (e) {}
    }

    const inventoryCount = p.inventories?.length || 0;
    const saleCount = (p.listings || []).filter(
      (l: any) => l.transactionType === "SALE" && (l.unitStatus === "DANG_BAN" || l.unitStatus === "CHO_DUYET")
    ).length;
    const rentCount = (p.listings || []).filter(
      (l: any) => l.transactionType === "RENT" && (l.unitStatus === "DANG_BAN" || l.unitStatus === "DANG_CHO_THUE" || l.unitStatus === "CHO_DUYET")
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
