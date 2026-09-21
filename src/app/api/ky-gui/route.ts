import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { processPublicLead } from "@/lib/leadService";
import { validatePhone } from "@/lib/utils";

// Khách gửi yêu cầu Ký gửi BĐS (bán hoặc cho thuê hộ)
// Cho phép cả Khách vãng lai và User đã đăng nhập gửi form.
export async function POST(req: Request) {
  const limited = rateLimit(req, "ky-gui-public", { limit: 10, windowMs: 10 * 60_000 });
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
      return NextResponse.json({ error: "Vui lòng nhập họ và tên." }, { status: 400 });
    }

    const phoneError = validatePhone(body.phone);
    if (phoneError) {
      return NextResponse.json({ error: phoneError }, { status: 400 });
    }

    if (!body.propertyTypeInterest || !body.demandType) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
    }

    const apartmentTypes = ["CAN_HO", "OFFICETEL", "CONDOTEL", "PENTHOUSE", "DUPLEX", "SHOPHOUSE_KHOI_DE", "DAT_NEN_DU_AN"];
    const isApartment = apartmentTypes.includes(body.propertyTypeInterest);

    let finalProjectId: string | null = body.projectId && body.projectId !== "NONE" ? body.projectId : null;

    if (isApartment && !finalProjectId) {
      return NextResponse.json({ error: "Vui lòng chọn dự án đối với loại hình căn hộ/chung cư" }, { status: 400 });
    }

    if (finalProjectId) {
      const project = await prisma.project.findUnique({ where: { id: finalProjectId } });
      if (!project || !project.isActive) {
        return NextResponse.json({ error: "Dự án đã chọn không hợp lệ hoặc ngưng hoạt động" }, { status: 400 });
      }
    }

    const result = await processPublicLead({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || session?.user?.email || null,
      demandType: body.demandType,
      source: "CONSIGNMENT",
      // note: body.note || `Ký gửi BĐS: ${body.propertyTypeInterest} ${body.areaInterest ? `(${body.areaInterest})` : ""}`,
      projectId: finalProjectId,
      refToken: body.refToken || null,
      pageUrl: body.pageUrl || null,
      utmSource: body.utmSource || null,
    });

    return NextResponse.json(
      {
        ok: true,
        // message: "Gửi thông tin ký gửi thành công! Đội ngũ tư vấn sẽ liên hệ lại kiểm tra căn hộ và xác nhận.",
        customerId: result.customerId,
        inquiryId: result.inquiryId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Lỗi gửi ký gửi:", err);
    return NextResponse.json({ error: err.message || "Không thể gửi yêu cầu ký gửi." }, { status: 400 });
  }
}
