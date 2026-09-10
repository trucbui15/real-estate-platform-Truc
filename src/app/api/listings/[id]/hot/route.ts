export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canToggleHotListing } from "@/lib/permissions";

// PATCH /api/listings/[id]/hot
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !canToggleHotListing(session.user?.role)) {
    return NextResponse.json(
      { error: "Bạn không có quyền thay đổi trạng thái HOT của tin đăng (chỉ dành cho Quản trị / Quản lý)" },
      { status: 403 }
    );
  }

  const existing = await prisma.listing.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy tin đăng" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const isHot = Boolean(body.isHot);

  try {
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        isHot,
        hotAt: isHot ? new Date() : null,
      },
      include: {
        project: true,
        province: true,
        district: true,
        author: { select: { id: true, name: true, role: true, email: true, phone: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Lỗi cập nhật trạng thái HOT tin đăng:", err);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái HOT" }, { status: 500 });
  }
}
