import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectMicrositeRenderer from "@/components/microsite/ProjectMicrositeRenderer";
import { CONTACT_CONFIG } from "@/config/contact";

export const revalidate = 60; // Revalidate ISR every 60s

interface Props {
  params: { slug: string };
}

// 1. DYNAMIC METADATA & SELF-CANONICAL FOR SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: { website: true },
    });

    if (!project) {
      return {
        title: "Dự án không tồn tại | Minh Dũng Land",
      };
    }

    const ws = project.website;
    const title = ws?.publishedMetaTitle || `${project.name} | Website Chính Thức Minh Dũng Land`;
    const description =
      ws?.publishedMetaDescription ||
      project.description ||
      `Thông tin chính thức, bảng giá, mặt bằng và tiến độ dự án ${project.name}`;
    const ogImage = ws?.publishedOgImage || project.thumbnail || "/logo.png";
    const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || CONTACT_CONFIG.websiteUrl;
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");
    const canonicalUrl = `${baseUrl}/du-an/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        images: [{ url: ogImage }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch (e) {
    return { title: "Website Dự Án | Minh Dũng Land" };
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDeniedUnitCode } from "@/lib/permissions";

// 2. PUBLIC MICROSITE PAGE COMPONENT
export default async function PublicProjectWebsitePage({ params }: Props) {
  const { slug } = params;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const isDenied = isDeniedUnitCode(userRole);

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      website: true,
      resources: {
        where: { isActive: true, isPublic: true },
        orderBy: { sortOrder: "asc" },
      },
      inventories: {
        orderBy: [{ block: "asc" }, { unitCode: "asc" }],
      },
      listings: {
        where: {
          unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] },
        },
        orderBy: { createdAt: "desc" },
        include: { author: true, project: true },
      },
      province: true,
      district: true,
    },
  });

  if (!project) {
    notFound();
  }

  const website = project.website;
  const isPublishedWebsite = website && website.status === "PUBLISHED";

  let sectionsConfig: any[] = [];
  let contentJson: any = {};

  if (isPublishedWebsite) {
    try {
      if (website.publishedSectionsConfig) {
        sectionsConfig = JSON.parse(website.publishedSectionsConfig);
      }
    } catch (e) {
      console.error("Lỗi parse publishedSectionsConfig:", e);
    }

    try {
      if (website.publishedContentJson) {
        contentJson = JSON.parse(website.publishedContentJson);
      }
    } catch (e) {
      console.error("Lỗi parse publishedContentJson:", e);
    }
  } else {
    // TỰ ĐỘNG TẠO CONFIG & CONTENT DỰA TRÊN DATABASE (DATABASE-DRIVEN CONTENT)
    const tour360Resource = project.resources.find((r) => r.type === "TOUR_360");
    const videoResource = project.resources.find((r) => r.type === "VIDEO");
    const floorPlanResources = project.resources.filter(
      (r) => r.type === "FLOOR_PLAN" || r.type === "DESIGN_FILE"
    );
    const imageResources = project.resources.filter((r) => r.type === "IMAGE");
    const policyResources = project.resources.filter(
      (r) => r.type === "SALES_POLICY" || r.type === "PRICE_LIST"
    );

    let parsedImages: string[] = [];
    if (project.images) {
      try {
        const p = JSON.parse(project.images);
        if (Array.isArray(p)) parsedImages = p;
      } catch (e) {}
    }

    const locationStr =
      project.address ||
      [project.district?.name, project.province?.name].filter(Boolean).join(", ") ||
      "Quy Nhơn, Bình Định";

    sectionsConfig = [
      { id: "hero", title: "Hero Banner", enabled: true, order: 1 },
      { id: "overview", title: "Tổng Quan Dự Án", enabled: true, order: 2 },
      { id: "location", title: "Vị Trí & Kết Nối Giao Thông", enabled: !!project.address || !!locationStr, order: 3 },
      { id: "amenities", title: "Hệ Thống Tiện Ích", enabled: false, order: 4 },
      { id: "floor_plans", title: "Mặt Bằng Tầng", enabled: floorPlanResources.length > 0, order: 5 },
      { id: "unit_types", title: "Căn Hộ & Bảng Hàng", enabled: project.inventories.length > 0 || project.listings.length > 0, order: 6 },
      { id: "gallery", title: "Bộ Sưu Tập Ảnh", enabled: !!project.thumbnail || parsedImages.length > 0 || imageResources.length > 0, order: 7 },
      { id: "video", title: "Video & Tour 360°", enabled: !!tour360Resource || !!videoResource, order: 8 },
      { id: "progress", title: "Tiến Độ Thi Công", enabled: false, order: 9 },
      { id: "sales_policy", title: "Chính Sách Bán Hàng", enabled: policyResources.length > 0, order: 10 },
      { id: "documents", title: "Tài Liệu Dự Án", enabled: project.resources.length > 0, order: 11 },
      { id: "contact", title: "Form Đăng Ký & Liên Hệ", enabled: true, order: 12 },
    ];

    contentJson = {
      hero: {
        title: project.name,
        subtitle: project.description || `Thông tin chính thức dự án ${project.name} tại ${locationStr}`,
        tagLine: project.developer ? `Chủ đầu tư: ${project.developer}` : "Dự Án Bất Động Sản",
        bgImage: project.thumbnail || (parsedImages.length > 0 ? parsedImages[0] : null),
        videoUrl: videoResource?.url || null,
        ctaText: "Đăng ký nhận Bảng giá & Thông tin",
      },
      overview: {
        headline: `Tổng quan chi tiết dự án ${project.name}`,
        summary: project.description || `Dự án ${project.name} tọa lạc tại ${locationStr}, do ${project.developer || "Chủ đầu tư uy tín"} phát triển.`,
        specs: [
          { label: "Tên dự án", value: project.name },
          { label: "Chủ đầu tư", value: project.developer || "Đang cập nhật" },
          { label: "Địa chỉ", value: locationStr },
          { label: "Sản phẩm bảng hàng", value: project.inventories.length > 0 ? `${project.inventories.length} căn` : "Đang cập nhật" },
        ],
      },
      location: {
        address: locationStr,
      },
      floor_plans: {
        title: `Mặt bằng thiết kế dự án ${project.name}`,
        blocks: floorPlanResources.map((r) => ({
          name: r.title,
          image: r.url,
          desc: r.description || undefined,
        })),
      },
      gallery: {
        title: `Hình ảnh thực tế dự án ${project.name}`,
        images: [
          ...(project.thumbnail ? [{ url: project.thumbnail, caption: project.name }] : []),
          ...parsedImages.map((url) => ({ url, caption: project.name })),
          ...imageResources.map((r) => ({ url: r.url, caption: r.title })),
        ],
      },
      video: {
        title: `Trải nghiệm Video & Tour 360° ${project.name}`,
        tour360Url: tour360Resource?.url || undefined,
        videoUrl: videoResource?.url || undefined,
      },
      documents: {
        title: `Tài liệu & Hồ sơ dự án ${project.name}`,
      },
    };
  }

  return (
    <ProjectMicrositeRenderer
      projectId={project.id}
      projectSlug={project.slug}
      projectName={project.name}
      developer={project.developer}
      address={project.address}
      sectionsConfig={sectionsConfig}
      contentJson={contentJson}
      inventories={isDenied ? project.inventories.map((u) => ({ ...u, unitCode: null })) : project.inventories}
      listings={project.listings}
      resources={project.resources}
      metaTitle={website?.publishedMetaTitle || undefined}
      metaDescription={website?.publishedMetaDescription || undefined}
      ogImage={website?.publishedOgImage || undefined}
      isPreview={false}
    />
  );
}

