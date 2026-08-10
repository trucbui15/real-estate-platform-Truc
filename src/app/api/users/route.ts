import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers, canManageAllListings } from "@/lib/permissions";

// ADMIN và MANAGER được xem danh sách nhân sự để phân công khách hàng
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageAllListings(session.user.role)) {
    return NextResponse.json({ error: "Chỉ Quản lý và Admin được xem danh sách nhân sự" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || undefined;

  const users = await prisma.user.findMany({
    where: {
      active: true,
      role: role ? (role as any) : { in: ["ADMIN", "MANAGER", "STAFF"] },
    },
    select: { id: true, name: true, email: true, phone: true, role: true, referralCode: true, active: true, createdAt: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(users);
}


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Chỉ Admin mới có quyền tạo tài khoản nội bộ" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Thiếu trường bắt buộc (Tên, Email, Mật khẩu, Vai trò)" }, { status: 400 });
  }
  if (!["ADMIN", "MANAGER", "STAFF"].includes(body.role)) {
    return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email này đã tồn tại trên hệ thống" }, { status: 409 });

  // Tự động sinh referralCode độc nhất cho nhân sự (vd: MD_T92, MD_S14...)
  let referralCode = body.referralCode?.trim().toUpperCase();
  if (!referralCode) {
    const initial = body.name.trim().charAt(0).toUpperCase();
    let isUnique = false;
    while (!isUnique) {
      const rand = Math.floor(10 + Math.random() * 89);
      referralCode = `MD_${initial}${rand}`;
      const check = await prisma.user.findUnique({ where: { referralCode } });
      if (!check) isUnique = true;
    }
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone ? body.phone.trim() : null,
      passwordHash,
      role: body.role,
      referralCode,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, referralCode: user.referralCode }, { status: 201 });
}
