import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProjectsAndNews } from "@/lib/permissions";

// POST /api/projects/[id]/website/publish
// Thao tác Xuất bản (Publish) hoặc Hủy xuất bản (Unpublish) trong Prisma Transaction
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canManageProjectsAndNews((session.user as any).role)) {
      return NextResponse.json({ error: "Bạn không có quyền quản lý xuất bản website dự án" }, { status: 403 });
    }

    const projectId = params.id;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { website: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "publish"; // "publish" | "unpublish"
    const targetUrl = `/du-an/${project.slug}`;

    // --- CASE 1: UNPUBLISH ---
    if (action === "unpublish") {
      if (!project.website) {
        return NextResponse.json({ error: "Website dự án chưa tạo bản nháp" }, { status: 400 });
      }

      // Xử lý Unpublish trong Transaction:
      // 1. Chuyển status = "DRAFT", GIỮ NGUYÊN các trường published* snapshot làm bản lưu trữ
      // 2. Ẩn ProjectResource loại WEBSITE liên quan (isPublic = false)
      const [updated] = await prisma.$transaction(async (tx) => {
        const updatedWebsite = await tx.projectWebsite.update({
          where: { id: project.website!.id },
          data: { status: "DRAFT" }, // GIỮ NGUYÊN published* fields
        });

        await tx.projectResource.updateMany({
          where: {
            projectId: project.id,
            type: "WEBSITE",
            url: targetUrl,
          },
          data: {
            isPublic: false,
          },
        });

        return [updatedWebsite];
      });

      return NextResponse.json({
        message: "Đã hủy xuất bản website dự án (chuyển về bản nháp, giữ nguyên snapshot đã xuất bản)",
        status: updated.status,
      });
    }

    // --- CASE 2: PUBLISH ---
    const website = project.website;
    if (!website || (!website.draftSectionsConfig && !website.draftContentJson)) {
      return NextResponse.json({ error: "Chưa có nội dung bản nháp để xuất bản" }, { status: 400 });
    }

    // Thực hiện PUBLISH trong Prisma Transaction
    const [published] = await prisma.$transaction(async (tx) => {
      // 1. Sao chép toàn bộ dữ liệu từ draft* sang published*
      const updatedWebsite = await tx.projectWebsite.update({
        where: { id: website.id },
        data: {
          status: "PUBLISHED",
          publishedSectionsConfig: website.draftSectionsConfig,
          publishedContentJson: website.draftContentJson,
          publishedMetaTitle: website.draftMetaTitle,
          publishedMetaDescription: website.draftMetaDescription,
          publishedOgImage: website.draftOgImage,
          publishedAt: new Date(),
        },
      });

      // 2. Kiểm tra tránh trùng lặp ProjectResource (Tái sử dụng / Update nếu đã tồn tại)
      const existingResource = await tx.projectResource.findFirst({
        where: {
          projectId: project.id,
          type: "WEBSITE",
          url: targetUrl,
        },
      });

      if (existingResource) {
        // Cập nhật lại resource hiện có
        await tx.projectResource.update({
          where: { id: existingResource.id },
          data: {
            title: `Website Chính Thức - ${project.name}`,
            description: `Trang thông tin tổng quan, tiện ích, mặt bằng và bảng giá chính thức dự án ${project.name}`,
            isPublic: true,
            isActive: true,
          },
        });
      } else {
        // Tạo mới duy nhất 1 resource nếu chưa tồn tại
        await tx.projectResource.create({
          data: {
            projectId: project.id,
            type: "WEBSITE",
            title: `Website Chính Thức - ${project.name}`,
            url: targetUrl,
            description: `Trang thông tin tổng quan, tiện ích, mặt bằng và bảng giá chính thức dự án ${project.name}`,
            isPublic: true,
            isActive: true,
            sortOrder: 0,
          },
        });
      }

      return [updatedWebsite];
    });

    return NextResponse.json({
      message: "Xuất bản website dự án thành công!",
      publishedUrl: targetUrl,
      website: published,
    });
  } catch (error: any) {
    console.error("Lỗi xuất bản ProjectWebsite:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xuất bản website dự án" }, { status: 500 });
  }
}
