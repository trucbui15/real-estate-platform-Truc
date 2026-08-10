import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";

// Sửa vai trò / khoá-mở / reset mật khẩu tài khoản
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Chỉ Admin được sửa tài khoản" }, { status: 403 });
  }
  const body = await req.json();

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.role !== undefined) updateData.role = body.role;
  if (body.active !== undefined) updateData.active = body.active;
  if (body.password && body.password.trim().length >= 6) {
    updateData.passwordHash = await bcrypt.hash(body.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới được xóa tài khoản" }, { status: 403 });
  }

  const currentUserId = (session.user as any)?.id;
  if (currentUserId && currentUserId === params.id) {
    return NextResponse.json({ error: "Bạn không thể tự xóa tài khoản đang đăng nhập" }, { status: 400 });
  }

  try {
    // Clean up or disconnect user activities / favorites before deleting
    await prisma.customerActivity.deleteMany({ where: { authorId: params.id } });
    await prisma.favorite.deleteMany({ where: { userId: params.id } });
    
    // Hard delete user
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, message: "Đã xóa tài khoản thành công" });
  } catch (error) {
    // If foreign key constraint prevents hard delete (e.g. linked to listings/projects), deactivate instead
    await prisma.user.update({ where: { id: params.id }, data: { active: false } });
    return NextResponse.json({ ok: true, message: "Tài khoản chứa dữ liệu liên kết nên đã được khóa ngắt truy cập" });
  }
}


