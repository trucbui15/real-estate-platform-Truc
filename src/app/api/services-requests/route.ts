import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBackofficeRole } from "@/lib/permissions";

// GET /api/services-requests
// Lấy danh sách các yêu cầu Đặt phòng & Visa riêng biệt trong CRM Dashboard
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isBackofficeRole(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "BOOKING" | "VISA" | "ALL"
  const keyword = searchParams.get("keyword")?.trim();

  try {
    const andConditions: any[] = [];

    if (type === "BOOKING") {
      andConditions.push({ note: { contains: "[ĐẶT PHÒNG" } });
    } else if (type === "VISA") {
      andConditions.push({ note: { contains: "[DỊCH VỤ VISA" } });
    } else {
      andConditions.push({
        OR: [
          { note: { contains: "[ĐẶT PHÒNG" } },
          { note: { contains: "[DỊCH VỤ VISA" } },
        ],
      });
    }

    if (keyword) {
      andConditions.push({
        OR: [
          { customer: { fullName: { contains: keyword, mode: "insensitive" } } },
          { customer: { phone: { contains: keyword } } },
          { note: { contains: keyword, mode: "insensitive" } },
        ],
      });
    }

    // Truy vấn các CustomerInquiry liên quan đến Đặt phòng & Visa
    const inquiries = await prisma.customerInquiry.findMany({
      where: {
        AND: andConditions,
      },
      include: {
        customer: {
          include: {
            assignedTo: { select: { id: true, name: true, role: true } },
            assignedCollaborator: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inquiries);
  } catch (err: any) {
    console.error("Lỗi lấy danh sách đặt phòng & visa:", err);
    return NextResponse.json({ error: "Không thể lấy dữ liệu" }, { status: 500 });
  }
}
