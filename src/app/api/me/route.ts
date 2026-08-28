import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone, validatePhone } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, referralCode: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
  }

  const collab = await prisma.collaborator.findUnique({
    where: { userId: session.user.id },
    select: { publicReferralToken: true, status: true },
  });

  return NextResponse.json({
    ...user,
    publicReferralToken: collab?.publicReferralToken || null,
    collaboratorStatus: collab?.status || null,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { name, phone } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập họ và tên" }, { status: 400 });
    }

    let cleanPhone: string | null = null;
    if (phone !== undefined && phone !== null && String(phone).trim() !== "") {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        return NextResponse.json({ error: phoneError }, { status: 400 });
      }
      cleanPhone = normalizePhone(phone);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        ...(phone !== undefined ? { phone: cleanPhone } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({
      message: "Cập nhật thông tin cá nhân thành công!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra khi cập nhật thông tin" }, { status: 500 });
  }
}
