import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProjectsAndNews } from "@/lib/permissions";
import { ProjectResourceType } from "@prisma/client";

// GET /api/project-resources/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isBackoffice = session && canManageProjectsAndNews(session.user.role);

  const resource = await prisma.projectResource.findUnique({
    where: { id: params.id },
    include: { project: { select: { id: true, name: true, slug: true } } },
  });

  if (!resource) {
    return NextResponse.json({ error: "Không tìm thấy tài liệu" }, { status: 404 });
  }

  if (!isBackoffice && (!resource.isActive || !resource.isPublic)) {
    return NextResponse.json({ error: "Không tìm thấy tài liệu" }, { status: 404 });
  }

  return NextResponse.json(resource);
}

// PUT / PATCH /api/project-resources/[id] (Admin / Manager)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 });
  }

  const existing = await prisma.projectResource.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy tài liệu." }, { status: 404 });
  }

  try {
    const body = await req.json();

    // 1. Validate title if provided
    let title = existing.title;
    if (body.title !== undefined) {
      title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title) {
        return NextResponse.json({ error: "Vui lòng nhập tên tài liệu." }, { status: 400 });
      }
      if (title.length > 200) {
        return NextResponse.json({ error: "Tên tài liệu không được vượt quá 200 ký tự." }, { status: 400 });
      }
    }

    // 2. Validate URL if provided
    let url = existing.url;
    if (body.url !== undefined) {
      url = typeof body.url === "string" ? body.url.trim() : "";
      if (!url) {
        return NextResponse.json({ error: "Vui lòng nhập đường dẫn hợp lệ." }, { status: 400 });
      }
      if (!/^https?:\/\/.+/i.test(url)) {
        return NextResponse.json(
          { error: "Vui lòng nhập đường dẫn hợp lệ (bắt đầu bằng http:// hoặc https://)." },
          { status: 400 }
        );
      }
    }

    // 3. Validate type if provided
    let type = existing.type;
    if (body.type !== undefined) {
      if (!Object.values(ProjectResourceType).includes(body.type)) {
        return NextResponse.json({ error: "Loại tài liệu không hợp lệ." }, { status: 400 });
      }
      type = body.type;
    }

    const updated = await prisma.projectResource.update({
      where: { id: params.id },
      data: {
        title,
        url,
        type,
        projectId: body.projectId || existing.projectId,
        description: body.description !== undefined ? (typeof body.description === "string" ? body.description.trim() : null) : existing.description,
        isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : existing.isPublic,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        sortOrder: typeof body.sortOrder === "number" ? Math.max(0, body.sortOrder) : existing.sortOrder,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Error updating project resource:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra khi cập nhật tài liệu." }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  return PUT(req, ctx);
}

// DELETE /api/project-resources/[id] (Admin / Manager)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 });
  }

  const existing = await prisma.projectResource.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy tài liệu." }, { status: 404 });
  }

  await prisma.projectResource.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true, message: "Đã xóa tài liệu thành công." });
}
