export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManageProjectsAndNews } from "@/lib/permissions";

// GET /api/news/[id] — Chi tiết 1 bài viết
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const article = await prisma.news.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
  return NextResponse.json(article);
}

// PUT /api/news/[id] — Cập nhật bài viết
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền sửa bài viết" }, { status: 403 });
  }

  const existing = await prisma.news.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });

  const body = await req.json();

  let newSlug = existing.slug;
  if (body.slug && body.slug !== existing.slug) {
    newSlug = slugify(body.slug);
    const checkSlug = await prisma.news.findUnique({ where: { slug: newSlug } });
    if (checkSlug && checkSlug.id !== params.id) {
      newSlug = `${newSlug}-${Date.now().toString(36)}`;
    }
  }

  const newPublished = body.published !== undefined ? Boolean(body.published) : existing.published;
  let finalPublishedAt = existing.publishedAt;
  if (newPublished && !existing.publishedAt) {
    finalPublishedAt = new Date();
  }

  const updated = await prisma.news.update({
    where: { id: params.id },
    data: {
      title: body.title !== undefined ? body.title.trim() : existing.title,
      slug: newSlug,
      thumbnail: body.thumbnail !== undefined ? body.thumbnail || null : existing.thumbnail,
      summary: body.summary !== undefined ? body.summary?.trim() || null : existing.summary,
      category: body.category !== undefined ? body.category || null : existing.category,
      tags: body.tags !== undefined ? body.tags?.trim() || null : existing.tags,
      metaTitle: body.metaTitle !== undefined ? body.metaTitle?.trim() || null : existing.metaTitle,
      focusKeyword: body.focusKeyword !== undefined ? body.focusKeyword?.trim() || null : (existing as any).focusKeyword,
      ogImage: body.ogImage !== undefined ? body.ogImage || null : existing.ogImage,
      content: body.content !== undefined ? body.content : existing.content,
      published: newPublished,
      publishedAt: finalPublishedAt,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/news/[id] — Xóa bài viết
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền xóa bài viết" }, { status: 403 });
  }

  const existing = await prisma.news.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });

  await prisma.news.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true, message: "Đã xóa bài viết thành công" });
}
