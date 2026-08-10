import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManageProjectsAndNews } from "@/lib/permissions";

export async function GET() {
  const news = await prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(news);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.title || !body.content) return NextResponse.json({ error: "Thiếu tiêu đề/nội dung" }, { status: 400 });

  const news = await prisma.news.create({
    data: {
      title: body.title,
      slug: slugify(body.title) + "-" + Date.now().toString(36),
      content: body.content,
      thumbnail: body.thumbnail || null,
      authorId: session.user.id,
      published: body.published ?? true,
    },
  });
  return NextResponse.json(news, { status: 201 });
}
