import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageInventory, isDeniedUnitCode } from "@/lib/permissions";

// GET /api/project-inventory?projectId=...&block=...
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const block = searchParams.get("block") || undefined;

  if (!projectId) {
    return NextResponse.json({ error: "Thiếu projectId" }, { status: 400 });
  }

  const items = await prisma.projectInventory.findMany({
    where: {
      projectId,
      ...(block ? { block } : {}),
    },
    orderBy: [{ unitCode: "asc" }, { createdAt: "desc" }],
  });

  // Security enforcement: CTV Pro tuyệt đối không được nhận mã căn thật
  // Server sanitize: trả unitCode: null cho CTV Pro
  if (isDeniedUnitCode(userRole)) {
    const sanitizedItems = items.map((item) => ({
      ...item,
      unitCode: null, // Bảo mật tuyệt đối ở tầng server
    }));
    return NextResponse.json({ items: sanitizedItems });
  }

  return NextResponse.json({ items });
}

// POST /api/project-inventory — Thêm sản phẩm vào Bảng Hàng (Chỉ Admin / Manager / Staff)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageInventory(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.projectId || !body.unitCode || !body.area) {
    return NextResponse.json({ error: "Vui lòng cung cấp đầy đủ thông tin bắt buộc (dự án, mã căn, diện tích)" }, { status: 400 });
  }

  // Check unique constraint: projectId + unitCode
  const existing = await prisma.projectInventory.findUnique({
    where: {
      projectId_unitCode: {
        projectId: body.projectId,
        unitCode: body.unitCode.trim(),
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: `Mã căn ${body.unitCode} đã tồn tại trong bảng hàng dự án này` }, { status: 400 });
  }

  const newItem = await prisma.projectInventory.create({
    data: {
      projectId: body.projectId,
      unitCode: body.unitCode.trim(),
      block: body.block ? body.block.trim() : null,
      floor: body.floor ? body.floor.trim() : null,
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
      area: Number(body.area),
      doorDirection: body.doorDirection || null,
      balconyDirection: body.balconyDirection || null,
      furnitureStatus: body.furnitureStatus || "FULL_NOI_THAT",
      unitStatus: body.unitStatus || "DANG_BAN",
      description: body.description || null,
      images: body.images ? (typeof body.images === "string" ? body.images : JSON.stringify(body.images)) : null,
    },
  });

  return NextResponse.json(newItem, { status: 201 });
}
