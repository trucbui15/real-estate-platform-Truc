export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManageProjectsAndNews, isBackofficeRole } from "@/lib/permissions";

// GET /api/news?all=1&category=..&keyword=..
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const isBackoffice = isBackofficeRole(session?.user?.role);

  const showAll = searchParams.get("all") === "1" && isBackoffice;
  const category = searchParams.get("category") || undefined;
  const keyword = searchParams.get("keyword") || undefined;

  const where: any = {
    ...(showAll ? {} : { published: true }),
    ...(category ? { category } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { summary: { contains: keyword, mode: "insensitive" } },
            { tags: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const news = await prisma.news.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(news);
}

// POST /api/news — Tạo bài viết mới
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền tạo bài viết" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.title || !body.content) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc nội dung bài viết" }, { status: 400 });
  }

  let finalSlug = body.slug ? slugify(body.slug) : slugify(body.title);
  if (!finalSlug) finalSlug = "bai-viet-" + Date.now().toString(36);

  // Check unique slug
  const existingSlug = await prisma.news.findUnique({ where: { slug: finalSlug } });
  if (existingSlug) {
    finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
  }

  const isPublished = Boolean(body.published);

  try {
    const news = await prisma.news.create({
      data: {
        title: body.title.trim(),
        slug: finalSlug,
        thumbnail: body.thumbnail || null,
        summary: body.summary ? body.summary.trim() : null,
        category: body.category || null,
        tags: body.tags ? body.tags.trim() : null,
        metaTitle: body.metaTitle ? body.metaTitle.trim() : null,
        focusKeyword: body.focusKeyword ? body.focusKeyword.trim() : null,
        ogImage: body.ogImage || null,
        content: body.content,
        authorId: session.user.id,
        published: isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return NextResponse.json(news, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Không thể tạo bài viết" }, { status: 500 });
  }
}
