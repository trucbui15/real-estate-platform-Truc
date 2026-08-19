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

    if (!project || !project.website || project.website.status !== "PUBLISHED") {
      return {
        title: "Dự án không tồn tại | Minh Dũng Land",
      };
    }

    const ws = project.website;
    const title = ws.publishedMetaTitle || `${project.name} | Website Chính Thức`;
    const description = ws.publishedMetaDescription || project.description || `Website thông tin chính thức dự án ${project.name}`;
    const ogImage = ws.publishedOgImage || project.thumbnail || "/logo.png";
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

// 2. PUBLIC MICROSITE PAGE COMPONENT
export default async function PublicProjectWebsitePage({ params }: Props) {
  const { slug } = params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { website: true },
  });

  // Chỉ hiển thị trang public nếu dự án tồn tại và đã XUẤT BẢN (status === PUBLISHED)
  if (!project || !project.website || project.website.status !== "PUBLISHED") {
    notFound();
  }

  const website = project.website;

  let sectionsConfig = [];
  let contentJson = {};

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

  return (
    <ProjectMicrositeRenderer
      projectId={project.id}
      projectSlug={project.slug}
      projectName={project.name}
      developer={project.developer}
      address={project.address}
      sectionsConfig={sectionsConfig}
      contentJson={contentJson}
      metaTitle={website.publishedMetaTitle || undefined}
      metaDescription={website.publishedMetaDescription || undefined}
      ogImage={website.publishedOgImage || undefined}
      isPreview={false}
    />
  );
}
