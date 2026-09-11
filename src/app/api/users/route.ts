export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { canManageUsers, canAccessCRM } from "@/lib/permissions";
import { normalizePhone, validatePhone } from "@/lib/utils";

// ADMIN, MANAGER và STAFF/CTV PRO được xem danh sách người dùng / nhân sự
export async function GET(req: Request) {
  const authUser = await getCurrentAuthUser();
  if (!authUser || !canAccessCRM(authUser.role)) {
    return NextResponse.json({ error: "Không có quyền xem danh sách người dùng hoặc tài khoản đã bị khóa" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || undefined;
  const allParam = searchParams.get("all") === "true";
  const forAssign = searchParams.get("forAssign") === "true";
  const searchParam = searchParams.get("search")?.trim() || undefined;

  const where: any = {};

  // If forAssign is true -> internal active users only
  if (forAssign) {
    where.active = true;
    where.role = { in: ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"] };
  } else if (role && role !== "ALL") {
    if (role === "INTERNAL") {
      where.role = { in: ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"] };
    } else {
      where.role = role;
    }
    if (!allParam && !canManageUsers(authUser.role)) {
      where.active = true;
    }
  } else if (allParam || canManageUsers(authUser.role)) {
    // Admin user management or explicit all=true: include all roles (ADMIN, MANAGER, STAFF, COLLABORATOR_PRO, CUSTOMER)
    // and both active/inactive
  } else {
    // Default for non-admin CRM helpers: active internal staff
    where.active = true;
    where.role = { in: ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"] };
  }

  if (searchParam) {
    where.OR = [
      { name: { contains: searchParam, mode: "insensitive" } },
      { email: { contains: searchParam, mode: "insensitive" } },
      { phone: { contains: searchParam, mode: "insensitive" } },
      { referralCode: { contains: searchParam, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
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
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const authUser = await getCurrentAuthUser();
    if (!authUser || !canManageUsers(authUser.role)) {
      return NextResponse.json({ error: "Chỉ Admin mới có quyền tạo tài khoản người dùng" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Thiếu trường bắt buộc (Tên, Email, Mật khẩu, Vai trò)" }, { status: 400 });
    }
    if (!["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO", "CUSTOMER"].includes(body.role)) {
      return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });
    }

    let cleanPhone: string | null = null;
    if (body.phone && String(body.phone).trim() !== "") {
      const phoneError = validatePhone(body.phone);
      if (phoneError) {
        return NextResponse.json({ error: phoneError }, { status: 400 });
      }
      cleanPhone = normalizePhone(body.phone);
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
    if (existing) return NextResponse.json({ error: "Email này đã tồn tại trên hệ thống" }, { status: 409 });

    // Kiểm tra Mã giới thiệu (Ref) tùy chỉnh hoặc tự động sinh mã ngẫu nhiên
    let referralCode = body.referralCode?.trim().toUpperCase();
    if (referralCode) {
      const existingRef = await prisma.user.findUnique({ where: { referralCode } });
      if (existingRef) {
        return NextResponse.json(
          {
            error: `Mã giới thiệu (Ref) "${referralCode}" đã trùng với tài khoản khác (${existingRef.name} - ${existingRef.email}). Vui lòng chọn mã khác hoặc để trống để hệ thống tự tạo.`,
          },
          { status: 409 }
        );
      }
    } else {
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
        phone: cleanPhone,
        passwordHash,
        role: body.role,
        referralCode,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, referralCode: user.referralCode }, { status: 201 });
  } catch (err: any) {
    console.error("Lỗi tạo tài khoản mới:", err);
    return NextResponse.json({ error: err.message || "Có lỗi xảy ra khi khởi tạo tài khoản" }, { status: 500 });
  }
}
