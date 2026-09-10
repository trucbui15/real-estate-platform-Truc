import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDeniedUnitCode } from "@/lib/permissions";
import ProjectDetailClient from "./ProjectDetailClient";

import { SITE_URL } from "@/config/site";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, thumbnail: true },
  });

  if (!project) return { title: "Dự án không tồn tại - Minh Dũng Land" };
  const ogImage = project.thumbnail || "/og-image.jpg";
  const canonicalUrl = `${SITE_URL}/projects/${encodeURIComponent(params.slug)}`;
  return {
    title: `${project.name} | Minh Dũng Land`,
    description: project.description || `Bảng hàng, căn hộ bán và cho thuê tại ${project.name}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${project.name} | Minh Dũng Land`,
      description: project.description || `Bảng hàng, căn hộ bán và cho thuê tại ${project.name}`,
      url: canonicalUrl,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Minh Dũng Land`,
      description: project.description || `Bảng hàng, căn hộ bán và cho thuê tại ${project.name}`,
      images: [ogImage],
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      resources: {
        where: { isActive: true, isPublic: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!project) return notFound();

  // Query Bảng Hàng (Project Inventory Units)
  const rawInventoryUnits = await prisma.projectInventory.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: [{ unitCode: "asc" }, { createdAt: "desc" }],
  });

  // Server-Side Security Boundary:
  // Nếu là CTV Pro (isDeniedUnitCode = true), server sanitize gán unitCode: null trước khi serialize props
  const inventoryUnits = isDeniedUnitCode(userRole)
    ? rawInventoryUnits.map((u) => ({ ...u, unitCode: null }))
    : rawInventoryUnits;

  // Query Căn Đang Bán (Public Sale Listings)
  const saleListings = await prisma.listing.findMany({
    where: {
      projectId: project.id,
      transactionType: "SALE",
      unitStatus: { in: ["DANG_BAN"] },
    },
    orderBy: [{ isHot: "desc" }, { hotAt: "desc" }, { createdAt: "desc" }],
    include: { project: true, author: true },
  });

  // Query Căn Cho Thuê (Public Rent Listings)
  const rentListings = await prisma.listing.findMany({
    where: {
      projectId: project.id,
      transactionType: "RENT",
      unitStatus: { in: ["DANG_CHO_THUE"] },
    },
    orderBy: [{ isHot: "desc" }, { hotAt: "desc" }, { createdAt: "desc" }],
    include: { project: true, author: true },
  });

  return (
    <ProjectDetailClient
      project={project}
      inventoryUnits={inventoryUnits}
      saleListings={saleListings}
      rentListings={rentListings}
    />
  );
}
