import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCollaborators, canAccessCollaborators, canViewAllCollaborators } from "@/lib/permissions";

// GET /api/collaborators/[id] — Xem chi tiết 1 CTV & danh sách khách hàng được phân công
// - ADMIN / MANAGER: Xem chi tiết bất kỳ CTV nào
// - STAFF: CHỈ ĐƯỢC XEM chi tiết CTV do chính mình quản lý (referredByUserId = currentUser.id)
// - Khác: HTTP 403 Forbidden
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canAccessCollaborators(authUser.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập hoặc tài khoản đã bị khóa" }, { status: 403 });
  }

  const collaborator = await prisma.collaborator.findUnique({
    where: { id: params.id },
    include: {
      referredByUser: { select: { id: true, name: true, role: true, email: true, phone: true } },
      assignedCustomers: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          demandType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { inquiries: true, assignedCustomers: true } },
    },
  });

  if (!collaborator) {
    return NextResponse.json({ error: "Không tìm thấy CTV" }, { status: 404 });
  }

  const isManagerUp = canViewAllCollaborators(authUser.role);

  // STAFF security check: Bắt buộc CTV phải thuộc về Staff đang đăng nhập
  if (!isManagerUp && collaborator.referredByUserId !== authUser.id) {
    return NextResponse.json({ error: "Không có quyền xem thông tin CTV này" }, { status: 403 });
  }

  return NextResponse.json(collaborator);
}

// PUT /api/collaborators/[id] — Đổi trạng thái (Khóa / Kích hoạt) CTV
// Chỉ dành riêng cho ADMIN và MANAGER
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canManageCollaborators(authUser.role)) {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên và Quản lý mới có quyền thay đổi trạng thái CTV" },
      { status: 403 }
    );
  }

  const existing = await prisma.collaborator.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy CTV" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const newStatus = body.status; // ACTIVE or INACTIVE

    if (!["ACTIVE", "INACTIVE", "PENDING"].includes(newStatus)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const col = await tx.collaborator.update({
        where: { id: params.id },
        data: { status: newStatus },
      });

      // Nếu CTV có tài khoản User login, khóa luôn tài khoản User để chặn đăng nhập
      if (col.userId) {
        await tx.user.update({
          where: { id: col.userId },
          data: { active: newStatus === "ACTIVE" },
        });
      }

      return col;
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi cập nhật CTV" }, { status: 500 });
  }
}

// DELETE /api/collaborators/[id] — Xóa CTV
// Chỉ dành riêng cho ADMIN và MANAGER
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canManageCollaborators(authUser.role)) {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên và Quản lý mới có quyền xóa CTV" },
      { status: 403 }
    );
  }

  const existing = await prisma.collaborator.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy CTV" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Gỡ liên kết CTV khỏi các khách hàng CRM được phân công
      await tx.customer.updateMany({
        where: { assignedCollaboratorId: params.id },
        data: { assignedCollaboratorId: null },
      });

      // 2. Gỡ liên kết CTV khỏi các yêu cầu tư vấn (CustomerInquiry)
      await tx.customerInquiry.updateMany({
        where: { collaboratorId: params.id },
        data: { collaboratorId: null },
      });

      // 3. Xóa vĩnh viễn bản ghi Collaborator
      await tx.collaborator.delete({
        where: { id: params.id },
      });

      // 4. Nếu CTV có tài khoản User liên kết, xóa vĩnh viễn tài khoản User khỏi hệ thống
      if (existing.userId) {
        const uId = existing.userId;
        await tx.favorite.deleteMany({ where: { userId: uId } });
        await tx.customerActivity.deleteMany({ where: { authorId: uId } });
        await tx.customer.updateMany({ where: { assignedToId: uId }, data: { assignedToId: null } });
        await tx.collaborator.updateMany({ where: { referredByUserId: uId }, data: { referredByUserId: authUser.id } });
        await tx.listing.updateMany({ where: { authorId: uId }, data: { authorId: authUser.id } });
        await tx.user.delete({ where: { id: uId } });
      }
    }, {
      maxWait: 15000,
      timeout: 45000,
    });

    return NextResponse.json({ message: "Đã xóa vĩnh viễn Cộng tác viên và dữ liệu liên quan khỏi cơ sở dữ liệu" });
  } catch (err: any) {
    console.error("Lỗi xóa vĩnh viễn CTV:", err);
    return NextResponse.json({ error: err.message || "Lỗi xóa vĩnh viễn CTV" }, { status: 500 });
  }
}
