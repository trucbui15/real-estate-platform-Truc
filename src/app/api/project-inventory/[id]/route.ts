import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageInventory } from "@/lib/permissions";

// PUT /api/project-inventory/[id] — Sửa căn trong Bảng Hàng (Chỉ Admin / Manager / Staff)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageInventory(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
  }

  const existing = await prisma.projectInventory.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
  }

  const body = await req.json();

  const updatedItem = await prisma.projectInventory.update({
    where: { id: params.id },
    data: {
      ...(body.unitCode !== undefined ? { unitCode: body.unitCode.trim() } : {}),
      ...(body.block !== undefined ? { block: body.block ? body.block.trim() : null } : {}),
      ...(body.floor !== undefined ? { floor: body.floor ? body.floor.trim() : null } : {}),
      ...(body.salePrice !== undefined ? { salePrice: body.salePrice ? Number(body.salePrice) : null } : {}),
      ...(body.bedrooms !== undefined ? { bedrooms: body.bedrooms ? Number(body.bedrooms) : null } : {}),
      ...(body.bathrooms !== undefined ? { bathrooms: body.bathrooms ? Number(body.bathrooms) : null } : {}),
      ...(body.area !== undefined ? { area: Number(body.area) } : {}),
      ...(body.doorDirection !== undefined ? { doorDirection: body.doorDirection } : {}),
      ...(body.balconyDirection !== undefined ? { balconyDirection: body.balconyDirection } : {}),
      ...(body.furnitureStatus !== undefined ? { furnitureStatus: body.furnitureStatus } : {}),
      ...(body.unitStatus !== undefined ? { unitStatus: body.unitStatus } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.images !== undefined ? { images: typeof body.images === "string" ? body.images : JSON.stringify(body.images) } : {}),
    },
  });

  return NextResponse.json(updatedItem);
}

// DELETE /api/project-inventory/[id] — Xóa căn khỏi Bảng Hàng (Chỉ Admin / Manager / Staff)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageInventory(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
  }

  const existing = await prisma.projectInventory.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
  }

  await prisma.projectInventory.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
