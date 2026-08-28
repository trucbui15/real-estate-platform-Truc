import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { normalizePhone, validatePhone } from "@/lib/utils";

function generatePublicToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "CTV";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/collaborators/register — Đăng ký tài khoản Cộng tác viên (CTV)
export async function POST(req: Request) {
  const limited = rateLimit(req, "ctv-register", { limit: 5, windowMs: 15 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const fullName = body.fullName?.trim();
    const phoneError = validatePhone(body.phone);
    if (phoneError) {
      return NextResponse.json({ error: phoneError }, { status: 400 });
    }
    const phone = normalizePhone(body.phone);
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const referralCode = body.referralCode?.trim().toUpperCase();

    if (!fullName || !email || !password || !referralCode) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ Họ tên, Email, Mật khẩu và Mã giới thiệu" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 });
    }

    // 1. Kiểm tra Mã giới thiệu nội bộ của ADMIN / MANAGER / STAFF
    const recruiterUser = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, name: true, role: true, active: true },
    });

    if (
      !recruiterUser ||
      !recruiterUser.active ||
      !["ADMIN", "MANAGER", "STAFF"].includes(recruiterUser.role)
    ) {
      return NextResponse.json(
        { error: "Mã giới thiệu không tồn tại hoặc không hợp lệ trên hệ thống" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra trùng SĐT CTV
    const existingCol = await prisma.collaborator.findUnique({ where: { phone } });
    if (existingCol) {
      return NextResponse.json(
        { error: "Số điện thoại này đã được đăng ký làm CTV" },
        { status: 400 }
      );
    }

    // 3. Tạo hoặc gán User account cho CTV (nếu chưa có)
    let userId: string | null = null;
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
          data: {
            name: fullName,
            email,
            phone,
            passwordHash,
            role: "CUSTOMER",
          },
        });
        userId = newUser.id;
      }
    }

    // 4. Sinh publicReferralToken độc nhất
    let token = generatePublicToken();
    let isUnique = false;
    while (!isUnique) {
      const check = await prisma.collaborator.findUnique({ where: { publicReferralToken: token } });
      if (!check) isUnique = true;
      else token = generatePublicToken();
    }

    // 5. Tạo bản ghi Collaborator
    const collaborator = await prisma.collaborator.create({
      data: {
        fullName,
        phone,
        email: email || null,
        publicReferralToken: token,
        status: "ACTIVE",
        userId,
        referredByUserId: recruiterUser.id,
      },
      include: {
        referredByUser: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: `Đăng ký Cộng tác viên thành công! Người bảo trợ của bạn là: ${recruiterUser.name}`,
        collaborator: {
          id: collaborator.id,
          fullName: collaborator.fullName,
          publicReferralToken: collaborator.publicReferralToken,
          referredBy: collaborator.referredByUser.name,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Lỗi đăng ký CTV:", err);
    return NextResponse.json({ error: err.message || "Không thể đăng ký CTV. Vui lòng kiểm tra lại." }, { status: 400 });
  }
}
