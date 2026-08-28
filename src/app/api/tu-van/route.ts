import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { processPublicLead } from "@/lib/leadService";
import { validatePhone } from "@/lib/utils";

// API tiếp nhận đăng ký nhận tư vấn từ Footer / Form công khai
export async function POST(req: Request) {
  const limited = rateLimit(req, "tu-van-footer", { limit: 5, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    if (!body.fullName || !body.fullName.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập họ và tên." }, { status: 400 });
    }
    const phoneError = validatePhone(body.phone);
    if (phoneError) {
      return NextResponse.json({ error: phoneError }, { status: 400 });
    }

    const result = await processPublicLead({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      demandType: body.demandType || "TU_VAN",
      source: body.source || "FOOTER",
      note: body.note || "Đăng ký nhận tư vấn trực tiếp từ Footer website Minh Dũng Land",
      projectId: body.projectId || null,
      listingId: body.listingId || null,
      refToken: body.refToken || null,
      pageUrl: body.pageUrl || null,
      utmSource: body.utmSource || null,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Gửi thông tin tư vấn thành công! Đội ngũ tư vấn sẽ liên hệ lại trong thời gian sớm nhất.",
        customerId: result.customerId,
        inquiryId: result.inquiryId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Lỗi gửi tư vấn footer:", err);
    return NextResponse.json({ error: err.message || "Không thể gửi thông tin. Vui lòng kiểm tra lại số điện thoại." }, { status: 400 });
  }
}
