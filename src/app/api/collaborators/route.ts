import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCustomers, canViewAllCollaborators } from "@/lib/permissions";

// GET /api/collaborators — Lấy danh sách CTV trong Dashboard
// ADMIN & MANAGER: Xem tất cả CTV
// STAFF: Chỉ xem CTV do mình trực tiếp giới thiệu (referredByUserId = session.user.id)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const isManagerUp = canViewAllCollaborators(session.user.role);

  const collaborators = await prisma.collaborator.findMany({
    where: isManagerUp ? {} : { referredByUserId: session.user.id },
    include: {
      referredByUser: { select: { id: true, name: true, role: true } },
      _count: { select: { inquiries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(collaborators);
}
