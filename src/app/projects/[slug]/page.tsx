import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectDetailClient from "./ProjectDetailClient";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });

  if (!project) return { title: "Dự án không tồn tại - Minh Dũng Land" };
  return {
    title: `${project.name} | Minh Dũng Land`,
    description: project.description || `Bảng hàng, căn hộ bán và cho thuê tại ${project.name}`,
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
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
  const inventoryUnits = await prisma.projectInventory.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: [{ unitCode: "asc" }, { createdAt: "desc" }],
  });

  // Query Căn Đang Bán (Public Sale Listings)
  const saleListings = await prisma.listing.findMany({
    where: {
      projectId: project.id,
      transactionType: "SALE",
      unitStatus: { in: ["DANG_BAN"] },
    },
    orderBy: { createdAt: "desc" },
    include: { project: true, author: true },
  });

  // Query Căn Cho Thuê (Public Rent Listings)
  const rentListings = await prisma.listing.findMany({
    where: {
      projectId: project.id,
      transactionType: "RENT",
      unitStatus: { in: ["DANG_CHO_THUE"] },
    },
    orderBy: { createdAt: "desc" },
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

