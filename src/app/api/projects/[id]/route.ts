import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManageProjectsAndNews } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      province: { select: { id: true, name: true } },
      district: { select: { id: true, name: true } },
      _count: { select: { listings: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền sửa dự án này" }, { status: 403 });
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  const body = await req.json();
  const updateData: any = {};

  if (body.name && body.name.trim() !== existing.name) {
    updateData.name = body.name.trim();
    const newSlug = slugify(body.name);
    const existingSlug = await prisma.project.findFirst({
      where: { slug: newSlug, id: { not: params.id } },
    });
    updateData.slug = existingSlug ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
  }

  if (body.developer !== undefined) updateData.developer = body.developer ? body.developer.trim() : null;
  if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;
  if (body.address !== undefined) updateData.address = body.address ? body.address.trim() : null;
  if (body.provinceId !== undefined) updateData.provinceId = body.provinceId || null;
  if (body.districtId !== undefined) updateData.districtId = body.districtId || null;
  if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail || null;
  if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
  if (body.featured !== undefined) updateData.featured = Boolean(body.featured);

  try {
    const updated = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        province: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        _count: { select: { listings: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: "Lỗi cập nhật dự án." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền xóa dự án này" }, { status: 403 });
  }

  const existing = await prisma.project.findUnique({
    where: { id: params.id },
    include: { _count: { select: { listings: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  if (existing._count.listings > 0) {
    return NextResponse.json(
      {
        error: `Không thể xoá trực tiếp dự án đang có ${existing._count.listings} bất động sản liên quan. Hãy chuyển sản phẩm sang dự án khác hoặc đổi trạng thái dự án sang Tạm ngưng (không hoạt động).`,
      },
      { status: 400 }
    );
  }

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true, message: "Đã xóa dự án thành công." });
}
