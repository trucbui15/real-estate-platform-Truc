export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCustomers, canViewAllCollaborators } from "@/lib/permissions";

// GET /api/collaborators — Lấy danh sách CTV trong Dashboard
// forAssign=true hoặc ADMIN/MANAGER: Xem tất cả CTV active để phân công
// STAFF (xem danh sách quản lý): Chỉ xem CTV do mình trực tiếp giới thiệu
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const forAssign = searchParams.get("forAssign") === "true";
  const isManagerUp = canViewAllCollaborators(session.user.role);

  const whereCondition = (isManagerUp || forAssign)
    ? {}
    : { referredByUserId: session.user.id };

  const collaborators = await prisma.collaborator.findMany({
    where: whereCondition,
    include: {
      referredByUser: { select: { id: true, name: true, role: true } },
      _count: { select: { inquiries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(collaborators);
}
