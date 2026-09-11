export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCollaborators, canViewAllCollaborators } from "@/lib/permissions";

// GET /api/collaborators — Lấy danh sách CTV trong Dashboard
// - ADMIN / MANAGER: Xem toàn bộ CTV trên hệ thống, có thể search realtime
// - STAFF: CHỈ ĐƯỢC XEM CTV do chính mình quản lý/giới thiệu (referredByUserId = currentUser.id)
// - COLLABORATOR_PRO / CUSTOMER: Bị từ chối truy cập (HTTP 403)
export async function GET(req: Request) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canAccessCollaborators(authUser.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập danh sách CTV hoặc tài khoản đã bị khóa" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const forAssign = searchParams.get("forAssign") === "true";
  const keyword = searchParams.get("keyword")?.trim() || searchParams.get("q")?.trim();
  const isManagerUp = canViewAllCollaborators(authUser.role);

  // Server-side scope enforcement:
  // Nếu là STAFF: BẮT BUỘC chỉ được lọc CTV thuộc referredByUserId = authUser.id
  // Không cho phép dùng query param để xem trộm CTV của người khác
  const baseCondition: any = isManagerUp
    ? (forAssign ? { status: "ACTIVE" } : {})
    : { referredByUserId: authUser.id, ...(forAssign ? { status: "ACTIVE" } : {}) };

  const searchCondition = keyword
    ? {
        OR: [
          { fullName: { contains: keyword, mode: "insensitive" as const } },
          { phone: { contains: keyword } },
          { publicReferralToken: { contains: keyword, mode: "insensitive" as const } },
        ],
      }
    : {};

  const collaborators = await prisma.collaborator.findMany({
    where: {
      ...baseCondition,
      ...searchCondition,
    },
    include: {
      referredByUser: { select: { id: true, name: true, role: true } },
      _count: { select: { inquiries: true, assignedCustomers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(collaborators);
}
