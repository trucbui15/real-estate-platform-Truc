import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { processPublicLead } from "@/lib/leadService";

// API tiếp nhận Yêu cầu tư vấn từ chi tiết tin đăng (Listing Detail) hoặc các nút CTA Public
// KHÔNG bắt buộc đăng nhập. Tự động liên kết context tin đăng, dự án & referral token CTV.
export async function POST(req: Request) {
  const limited = rateLimit(req, "contact-request-public", { limit: 10, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!body.fullName || !body.fullName.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập họ và tên của bạn" }, { status: 400 });
    }
    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập số điện thoại liên hệ" }, { status: 400 });
    }

    let listing = null;
    if (body.listingId) {
      listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
    }

    const demandType = body.demandType || (listing ? (listing.transactionType === "RENT" ? "THUE" : "MUA") : "TU_VAN");

    const result = await processPublicLead({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || session?.user?.email || null,
      demandType,
      source: "LISTING",
      note: body.note || (listing ? `Quan tâm tin đăng: ${listing.title} (${listing.unitCode})` : "Yêu cầu tư vấn"),
      listingId: listing?.id || body.listingId || null,
      projectId: listing?.projectId || body.projectId || null,
      refToken: body.refToken || null,
      pageUrl: body.pageUrl || null,
      utmSource: body.utmSource || null,
      utmMedium: body.utmMedium || null,
      utmCampaign: body.utmCampaign || null,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Gửi yêu cầu tư vấn thành công! Đội ngũ tư vấn sẽ liên hệ lại trong thời gian sớm nhất.",
        customerId: result.customerId,
        inquiryId: result.inquiryId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Lỗi gửi contact request:", err);
    return NextResponse.json({ error: err.message || "Không thể gửi thông tin. Vui lòng thử lại sau." }, { status: 400 });
  }
}
