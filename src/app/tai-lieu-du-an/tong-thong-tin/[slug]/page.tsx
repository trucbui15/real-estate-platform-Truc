import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

import { ProjectSalesKitHeader } from "@/components/sales-kit/ProjectSalesKitHeader";
import { ProjectResourceGrid } from "@/components/sales-kit/ProjectResourceGrid";
import { ProjectOverviewContent } from "@/components/sales-kit/ProjectOverviewContent";
import { ProjectImageGallery } from "@/components/sales-kit/ProjectImageGallery";
import { ProjectListingsStrip } from "@/components/sales-kit/ProjectListingsStrip";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug },
  });

  if (!project) {
    return {
      title: "Không tìm thấy dự án | Minh Dũng Land",
    };
  }

  return {
    title: `${project.name} | Tài liệu & Sales Kit Dự Án | Minh Dũng Land`,
    description: project.description || `Thông tin tổng quan, pháp lý, bảng hàng và bộ tài liệu tư vấn bán hàng dự án ${project.name}.`,
  };
}

export default async function ProjectNativeDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const isInternalUser = userRole === "STAFF" || userRole === "MANAGER" || userRole === "ADMIN";

  // Tìm dự án theo slug hoặc slug ngắn
  let project = await prisma.project.findFirst({
    where: {
      OR: [
        { slug: params.slug },
        { slug: `${params.slug}-quy-nhon` },
        { slug: params.slug.replace(/-quy-nhon$/, "") },
      ],
    },
    include: {
      province: true,
      district: true,
      resources: {
        where: isInternalUser
          ? { isActive: true }
          : { isActive: true, isPublic: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      listings: {
        where: { unitStatus: "DANG_BAN" },
        select: { id: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const images = parseImages(project.images);
  const coverImage = project.thumbnail || images[0] || null;

  return (
    <div className="container-page py-10 space-y-8">
      {/* 1. Hero Header Project */}
      <ProjectSalesKitHeader
        name={project.name}
        slug={project.slug}
        developer={project.developer}
        address={project.address}
        description={project.description}
        coverImage={coverImage}
        featured={project.featured}
        districtName={project.district?.name}
        provinceName={project.province?.name}
        listingsCount={project.listings.length}
        isInternalUser={isInternalUser}
        userRole={userRole}
      />

      {/* 2. Primary Data-Driven Resource Buttons Grid */}
      <ProjectResourceGrid
        projectName={project.name}
        resources={project.resources}
      />

      {/* 3. Detailed Native Overview Content */}
      <ProjectOverviewContent
        projectName={project.name}
        developer={project.developer}
        address={project.address}
      />

      {/* 4. Photo & 3D Renderings Gallery */}
      <ProjectImageGallery
        projectName={project.name}
        images={images}
      />

      {/* 5. Inventory & Active Resale/Rental Strip */}
      <ProjectListingsStrip
        projectName={project.name}
        projectSlug={project.slug}
        listingsCount={project.listings.length}
      />
    </div>
  );
}
