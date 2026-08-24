import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManageProjectsAndNews } from "@/lib/permissions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const provinceId = searchParams.get("provinceId") || undefined;
  const districtId = searchParams.get("districtId") || undefined;
  const isActiveStr = searchParams.get("isActive");
  const featuredStr = searchParams.get("featured");
  const limitStr = searchParams.get("limit");

  const where: any = {
    ...(provinceId ? { provinceId } : {}),
    ...(districtId ? { districtId } : {}),
    ...(isActiveStr === "true" ? { isActive: true } : isActiveStr === "false" ? { isActive: false } : {}),
    ...(featuredStr === "true" ? { featured: true } : featuredStr === "false" ? { featured: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { developer: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limitStr ? Number(limitStr) : undefined,
    include: {
      province: { select: { id: true, name: true, slug: true } },
      district: { select: { id: true, name: true, slug: true } },
      website: { select: { status: true } },
      _count: { select: { listings: true, inventories: true, resources: true } },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền quản lý dự án" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên dự án" }, { status: 400 });
  }

  const baseSlug = slugify(body.name);
  const existingSlug = await prisma.project.findUnique({ where: { slug: baseSlug } });
  const finalSlug = existingSlug ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  try {
    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        slug: finalSlug,
        developer: body.developer ? body.developer.trim() : null,
        description: body.description ? body.description.trim() : null,
        address: body.address ? body.address.trim() : null,
        provinceId: body.provinceId || null,
        districtId: body.districtId || null,
        thumbnail: body.thumbnail || null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        featured: body.featured !== undefined ? Boolean(body.featured) : false,
        authorId: session.user.id,
      },
      include: {
        province: { select: { name: true } },
        district: { select: { name: true } },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Không thể tạo dự án. Vui lòng kiểm tra dữ liệu." }, { status: 400 });
  }
}

