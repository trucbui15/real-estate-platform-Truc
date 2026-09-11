import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { normalizePhone, validatePhone } from "@/lib/utils";

// Sửa vai trò / khoá-mở / reset mật khẩu tài khoản
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canManageUsers(authUser.role)) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền sửa tài khoản" }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  }

  const body = await req.json();

  // Safeguard: Không cho phép tự khóa tài khoản của chính mình
  if (authUser.id === params.id && body.active === false) {
    return NextResponse.json({ error: "Bạn không thể tự khóa tài khoản của chính mình" }, { status: 400 });
  }

  // Safeguard: Không cho phép tự hạ quyền ADMIN của chính mình
  if (authUser.id === params.id && body.role && body.role !== "ADMIN") {
    return NextResponse.json({ error: "Bạn không thể tự hạ quyền Quản trị viên của chính mình" }, { status: 400 });
  }

  // Safeguard: Bảo vệ ADMIN cuối cùng
  const isDemotingOrLockingAdmin =
    targetUser.role === "ADMIN" &&
    targetUser.active &&
    (body.active === false || (body.role && body.role !== "ADMIN"));

  if (isDemotingOrLockingAdmin) {
    const activeAdminCount = await prisma.user.count({
      where: { role: "ADMIN", active: true },
    });
    if (activeAdminCount <= 1) {
      return NextResponse.json(
        { error: "Hệ thống chỉ còn duy nhất 1 Quản trị viên (ADMIN) đang hoạt động. Không thể khóa hoặc hạ vai trò tài khoản này." },
        { status: 400 }
      );
    }
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.phone !== undefined) {
    if (body.phone && String(body.phone).trim() !== "") {
      const phoneError = validatePhone(body.phone);
      if (phoneError) {
        return NextResponse.json({ error: phoneError }, { status: 400 });
      }
      updateData.phone = normalizePhone(body.phone);
    } else {
      updateData.phone = null;
    }
  }
  if (body.role !== undefined) {
    if (!["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO", "CUSTOMER"].includes(body.role)) {
      return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });
    }
    updateData.role = body.role;
  }
  if (body.active !== undefined) updateData.active = Boolean(body.active);
  if (body.password && body.password.trim().length >= 6) {
    updateData.passwordHash = await bcrypt.hash(body.password.trim(), 10);
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      referralCode: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}

// Xóa tài khoản người dùng: Audit Foreign Keys & Self-delete safeguard
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canManageUsers(authUser.role)) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền xóa tài khoản" }, { status: 403 });
  }

  const targetId = params.id;

  // 1. Chặn tự xóa chính tài khoản đang đăng nhập
  if (authUser.id === targetId) {
    return NextResponse.json({ error: "Bạn không thể tự xóa tài khoản đang đăng nhập" }, { status: 400 });
  }

  // 2. Tìm người dùng cần xóa
  const targetUser = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Không tìm thấy người dùng cần xóa" }, { status: 404 });
  }

  // 3. Bảo vệ Admin cuối cùng
  if (targetUser.role === "ADMIN" && targetUser.active) {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", active: true },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Hệ thống chỉ còn duy nhất 1 Quản trị viên (ADMIN) đang hoạt động. Không thể xóa tài khoản này." },
        { status: 400 }
      );
    }
  }

  // 4. Xóa sạch dữ liệu liên quan và thực hiện HARD DELETE khỏi database
  try {
    const collaboratorProfile = await prisma.collaborator.findUnique({ where: { userId: targetId } });

    await prisma.$transaction(async (tx) => {
      // a. Nếu tài khoản có hồ sơ CTV (Collaborator), xóa hồ sơ CTV và gỡ phân công
      if (collaboratorProfile) {
        await tx.customer.updateMany({
          where: { assignedCollaboratorId: collaboratorProfile.id },
          data: { assignedCollaboratorId: null },
        });
        await tx.customerInquiry.updateMany({
          where: { collaboratorId: collaboratorProfile.id },
          data: { collaboratorId: null },
        });
        await tx.collaborator.delete({
          where: { id: collaboratorProfile.id },
        });
      }

      // b. Reassign các CTV do tài khoản này bảo trợ/giới thiệu sang Quản trị viên hiện tại
      await tx.collaborator.updateMany({
        where: { referredByUserId: targetId },
        data: { referredByUserId: authUser.id },
      });

      // c. Gỡ phân công khỏi khách hàng CRM
      await tx.customer.updateMany({
        where: { assignedToId: targetId },
        data: { assignedToId: null },
      });

      // d. Xóa lịch sử chăm sóc do tài khoản này tạo
      await tx.customerActivity.deleteMany({
        where: { authorId: targetId },
      });

      // e. Reassign tin đăng BĐS, bài viết tin tức, dự án sang Admin hiện tại để bảo toàn nội dung website
      await tx.listing.updateMany({
        where: { authorId: targetId },
        data: { authorId: authUser.id },
      });
      await tx.news.updateMany({
        where: { authorId: targetId },
        data: { authorId: authUser.id },
      });
      await tx.project.updateMany({
        where: { authorId: targetId },
        data: { authorId: authUser.id },
      });

      // f. Xóa mục yêu thích
      await tx.favorite.deleteMany({
        where: { userId: targetId },
      });

      // g. Xóa vĩnh viễn bản ghi User khỏi cơ sở dữ liệu
      await tx.user.delete({
        where: { id: targetId },
      });
    }, {
      maxWait: 15000,
      timeout: 45000,
    });

    return NextResponse.json({
      ok: true,
      action: "HARD_DELETED",
      message: `Đã xóa vĩnh viễn tài khoản "${targetUser.name}" (${targetUser.email}) khỏi cơ sở dữ liệu.`,
    });
  } catch (err: any) {
    console.error("Lỗi xóa vĩnh viễn người dùng:", err);
    return NextResponse.json({ error: err.message || "Lỗi xóa tài khoản người dùng" }, { status: 500 });
  }
}
