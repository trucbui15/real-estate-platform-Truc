import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCollaborators } from "@/lib/permissions";

// PUT /api/collaborators/[id] — Đổi trạng thái (Khóa / Kích hoạt) CTV
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const existing = await prisma.collaborator.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy CTV" }, { status: 404 });
  }

  const isManagerUp = canManageCollaborators(session.user.role);
  const isRecruiter = existing.referredByUserId === session.user.id;

  if (!isManagerUp && !isRecruiter) {
    return NextResponse.json({ error: "Không có quyền quản lý CTV này" }, { status: 403 });
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
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const existing = await prisma.collaborator.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy CTV" }, { status: 404 });
  }

  const isManagerUp = canManageCollaborators(session.user.role);
  const isRecruiter = existing.referredByUserId === session.user.id;

  if (!isManagerUp && !isRecruiter) {
    return NextResponse.json({ error: "Không có quyền xóa CTV này" }, { status: 403 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Xóa bản ghi Collaborator
      await tx.collaborator.delete({
        where: { id: params.id },
      });

      // 2. Vô hiệu hóa tài khoản User đăng nhập liên kết
      if (existing.userId) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { active: false },
        });
      }
    });

    return NextResponse.json({ message: "Đã xóa Cộng tác viên thành công" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi xóa CTV" }, { status: 500 });
  }
}
