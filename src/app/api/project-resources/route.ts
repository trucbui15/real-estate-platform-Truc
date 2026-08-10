import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProjectsAndNews } from "@/lib/permissions";
import { ProjectResourceType } from "@prisma/client";

// GET /api/project-resources
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const isBackoffice = session && canManageProjectsAndNews(session.user.role);

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const type = searchParams.get("type") as ProjectResourceType | undefined;
  const search = searchParams.get("search") || undefined;
  const isActiveParam = searchParams.get("isActive");
  const isPublicParam = searchParams.get("isPublic");

  // Nếu là người dùng public (chưa đăng nhập hoặc Customer), bắt buộc chỉ lấy isActive=true và isPublic=true
  const where: any = {
    ...(projectId ? { projectId } : {}),
    ...(type && Object.values(ProjectResourceType).includes(type) ? { type } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { project: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  if (!isBackoffice) {
    where.isActive = true;
    where.isPublic = true;
  } else {
    if (isActiveParam !== null && isActiveParam !== undefined) {
      where.isActive = isActiveParam === "true";
    }
    if (isPublicParam !== null && isPublicParam !== undefined) {
      where.isPublic = isPublicParam === "true";
    }
  }

  const resources = await prisma.projectResource.findMany({
    where,
    include: {
      project: {
        select: { id: true, name: true, slug: true, featured: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(resources);
}

// POST /api/project-resources (Chỉ Admin / Manager)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageProjectsAndNews(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 });
  }

  try {
    const body = await req.json();

    // 1. Validate title
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Vui lòng nhập tên tài liệu." }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: "Tên tài liệu không được vượt quá 200 ký tự." }, { status: 400 });
    }

    // 2. Validate URL (Bắt buộc http:// hoặc https://)
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "Vui lòng nhập đường dẫn hợp lệ." }, { status: 400 });
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      return NextResponse.json(
        { error: "Vui lòng nhập đường dẫn hợp lệ (bắt đầu bằng http:// hoặc https://)." },
        { status: 400 }
      );
    }

    // 3. Validate type
    const type = body.type as ProjectResourceType;
    if (!type || !Object.values(ProjectResourceType).includes(type)) {
      return NextResponse.json({ error: "Loại tài liệu không hợp lệ." }, { status: 400 });
    }

    // 4. Validate projectId
    if (!body.projectId || typeof body.projectId !== "string") {
      return NextResponse.json({ error: "Dự án không tồn tại." }, { status: 400 });
    }
    const projectExists = await prisma.project.findUnique({ where: { id: body.projectId } });
    if (!projectExists) {
      return NextResponse.json({ error: "Dự án không tồn tại." }, { status: 404 });
    }

    // 5. Tạo ProjectResource
    const resource = await prisma.projectResource.create({
      data: {
        projectId: body.projectId,
        type,
        title,
        url,
        description: typeof body.description === "string" ? body.description.trim() : null,
        isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        sortOrder: typeof body.sortOrder === "number" ? Math.max(0, body.sortOrder) : 0,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (err: any) {
    console.error("Error creating project resource:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra khi tạo tài liệu." }, { status: 500 });
  }
}
