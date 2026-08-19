import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProjectsAndNews, isBackofficeRole } from "@/lib/permissions";

// GET /api/projects/[id]/website
// - Với Backoffice (Admin/Manager/Staff): Trả về cả dữ liệu Draft & Published
// - Với Khách/Public: Chỉ trả về dữ liệu Published nếu status === "PUBLISHED"
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const session = await getServerSession(authOptions);
    const isBackoffice = session?.user && isBackofficeRole((session.user as any).role);

    // Tìm theo id dự án hoặc slug dự án
    let project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        website: true,
        resources: {
          where: { type: "WEBSITE", isActive: true, isPublic: true },
        },
      },
    });

    if (!project) {
      project = await prisma.project.findUnique({
        where: { slug: projectId },
        include: {
          website: true,
          resources: {
            where: { type: "WEBSITE", isActive: true, isPublic: true },
          },
        },
      });
    }

    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
    }

    const website = project.website;

    if (!website) {
      return NextResponse.json({
        projectId: project.id,
        projectSlug: project.slug,
        projectName: project.name,
        status: "DRAFT",
        hasWebsite: false,
        website: null,
      });
    }

    if (isBackoffice) {
      return NextResponse.json({
        projectId: project.id,
        projectSlug: project.slug,
        projectName: project.name,
        hasWebsite: true,
        website,
      });
    }

    // Với Public user: Chỉ trả về dữ liệu đã Xuất bản (PUBLISHED)
    if (website.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Website dự án chưa được xuất bản" }, { status: 404 });
    }

    return NextResponse.json({
      projectId: project.id,
      projectSlug: project.slug,
      projectName: project.name,
      status: website.status,
      sectionsConfig: website.publishedSectionsConfig,
      contentJson: website.publishedContentJson,
      metaTitle: website.publishedMetaTitle || `${project.name} | Website Chính Thức`,
      metaDescription: website.publishedMetaDescription || project.description,
      ogImage: website.publishedOgImage || project.thumbnail,
      publishedAt: website.publishedAt,
    });
  } catch (error: any) {
    console.error("Lỗi lấy dữ liệu ProjectWebsite:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải thông tin website dự án" }, { status: 500 });
  }
}

// PUT /api/projects/[id]/website
// - Lưu dữ liệu BIÊN TẬP NHÁP (Draft)
// - Bắt buộc chỉ nhận các trường draft*
// - Validate định dạng JSON và giới hạn dung lượng
// - Tuyệt đối KHÔNG thay đổi dữ liệu đã xuất bản (Published live content)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canManageProjectsAndNews((session.user as any).role)) {
      return NextResponse.json({ error: "Bạn không có quyền quản lý website dự án" }, { status: 403 });
    }

    const projectId = params.id;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
    }

    const body = await req.json();
    
    // Độc quyền bóc tách CHỈ các trường draft* (loại bỏ mọi trường published* nếu client cố ý gửi lên)
    const {
      draftSectionsConfig,
      draftContentJson,
      draftMetaTitle,
      draftMetaDescription,
      draftOgImage,
    } = body;

    // 1. Kiểm tra & validate JSON draftSectionsConfig
    let finalSectionsConfig: string | null = null;
    if (draftSectionsConfig !== undefined && draftSectionsConfig !== null) {
      if (typeof draftSectionsConfig === "object") {
        finalSectionsConfig = JSON.stringify(draftSectionsConfig);
      } else if (typeof draftSectionsConfig === "string") {
        try {
          JSON.parse(draftSectionsConfig);
          finalSectionsConfig = draftSectionsConfig;
        } catch {
          return NextResponse.json({ error: "Cấu hình section (draftSectionsConfig) phải là chuỗi/đối tượng JSON hợp lệ" }, { status: 400 });
        }
      }
    }

    // 2. Kiểm tra & validate JSON draftContentJson
    let finalContentJson: string | null = null;
    if (draftContentJson !== undefined && draftContentJson !== null) {
      if (typeof draftContentJson === "object") {
        finalContentJson = JSON.stringify(draftContentJson);
      } else if (typeof draftContentJson === "string") {
        try {
          JSON.parse(draftContentJson);
          finalContentJson = draftContentJson;
        } catch {
          return NextResponse.json({ error: "Nội dung website (draftContentJson) phải là chuỗi/đối tượng JSON hợp lệ" }, { status: 400 });
        }
      }
    }

    // 3. Giới hạn dung lượng dữ liệu tối đa 5MB
    const payloadLength = (finalContentJson?.length || 0) + (finalSectionsConfig?.length || 0);
    if (payloadLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Dung lượng dữ liệu nháp vượt quá giới hạn cho phép (tối đa 5MB)" }, { status: 400 });
    }

    const updatedWebsite = await prisma.projectWebsite.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        status: "DRAFT",
        draftSectionsConfig: finalSectionsConfig,
        draftContentJson: finalContentJson,
        draftMetaTitle: typeof draftMetaTitle === "string" ? draftMetaTitle.trim() : null,
        draftMetaDescription: typeof draftMetaDescription === "string" ? draftMetaDescription.trim() : null,
        draftOgImage: typeof draftOgImage === "string" ? draftOgImage.trim() : null,
      },
      update: {
        draftSectionsConfig: finalSectionsConfig,
        draftContentJson: finalContentJson,
        draftMetaTitle: typeof draftMetaTitle === "string" ? draftMetaTitle.trim() : null,
        draftMetaDescription: typeof draftMetaDescription === "string" ? draftMetaDescription.trim() : null,
        draftOgImage: typeof draftOgImage === "string" ? draftOgImage.trim() : null,
      },
    });

    return NextResponse.json({
      message: "Lưu bản nháp website dự án thành công",
      website: updatedWebsite,
    });
  } catch (error: any) {
    console.error("Lỗi lưu bản nháp ProjectWebsite:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lưu bản nháp website dự án" }, { status: 500 });
  }
}
