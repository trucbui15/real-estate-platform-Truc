// Public Registration API — CHỈ DÀNH CHO CỘNG TÁC VIÊN (CTV)
// Tài khoản nội bộ (Admin/Manager/Staff) CHỈ được tạo bởi Admin từ /dashboard/users.
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const limited = rateLimit(req, "register-public", { limit: 5, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // 1. CHỐNG NÂNG QUYỀN TRÁI PHÉP: Chặn tuyệt đối việc gửi role nội bộ từ public API
    if (body.role && ["ADMIN", "MANAGER", "STAFF"].includes(String(body.role).toUpperCase())) {
      return NextResponse.json(
        { error: "Truy cập bị từ chối: Tài khoản nội bộ (Admin/Manager/Staff) chỉ được tạo bởi Quản trị viên từ Dashboard" },
        { status: 403 }
      );
    }

    // 2. Ép buộc Đăng ký Public chuyển về luồng Đăng ký CTV
    if (!body.referralCode) {
      return NextResponse.json(
        { error: "Đăng ký công khai hiện chỉ dành cho Cộng tác viên (CTV). Vui lòng cung cấp Mã giới thiệu hợp lệ." },
        { status: 400 }
      );
    }

    // Forward tới API Đăng ký CTV
    const registerUrl = new URL("/api/collaborators/register", req.url);
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi xử lý đăng ký public" }, { status: 400 });
  }
}
