import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBackofficeRole, isDeniedUnitCode } from "@/lib/permissions";
import ProjectMicrositeRenderer from "@/components/microsite/ProjectMicrositeRenderer";

interface Props {
  params: { slug: string };
}

export const metadata: Metadata = {
  title: "Xem Trước Bản Nháp (Draft Preview) | Website Dự Án",
  robots: { index: false, follow: false }, // Tuyệt đối không lưu index tìm kiếm Google
};

export default async function DraftPreviewProjectWebsitePage({ params }: Props) {
  const { slug } = params;

  // 1. KIỂM TRA PHÂN QUYỀN NỘI BỘ (ADMIN / MANAGER / STAFF / COLLABORATOR_PRO)
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session || !isBackofficeRole(userRole)) {
    redirect(`/login?callbackUrl=/du-an/${slug}/preview`);
  }

  // 2. TÌM DỰ ÁN & WEBSITE DATA
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
    },
  });

  if (!project || !project.website) {
    notFound();
  }

  const website = project.website;

  let sectionsConfig = [];
  let contentJson = {};

  try {
    if (website.draftSectionsConfig) {
      sectionsConfig = JSON.parse(website.draftSectionsConfig);
    }
  } catch (e) {
    console.error("Lỗi parse draftSectionsConfig:", e);
  }

  try {
    if (website.draftContentJson) {
      contentJson = JSON.parse(website.draftContentJson);
    }
  } catch (e) {
    console.error("Lỗi parse draftContentJson:", e);
  }

  const isDenied = isDeniedUnitCode(userRole);

  return (
    <ProjectMicrositeRenderer
      projectId={project.id}
      projectSlug={project.slug}
      projectName={project.name}
      developer={project.developer}
      address={project.address}
      sectionsConfig={sectionsConfig}
      contentJson={contentJson}
      inventories={isDenied ? (project.inventories || []).map((u: any) => ({ ...u, unitCode: null })) : project.inventories}
      listings={project.listings}
      resources={project.resources}
      metaTitle={website.draftMetaTitle || undefined}
      metaDescription={website.draftMetaDescription || undefined}
      ogImage={website.draftOgImage || undefined}
      isPreview={true}
    />
  );
}

