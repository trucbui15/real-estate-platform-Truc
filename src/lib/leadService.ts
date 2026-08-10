import { prisma } from "@/lib/prisma";
import { DemandType, LeadSource } from "@prisma/client";

export interface ProcessLeadInput {
  fullName: string;
  phone: string;
  email?: string | null;
  demandType?: DemandType | string;
  source?: LeadSource | string;
  note?: string | null;
  listingId?: string | null;
  projectId?: string | null;
  refToken?: string | null;
  pageUrl?: string | null;
  referrerUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

/**
 * Chuẩn hóa số điện thoại (xoá khoảng trắng, ký tự đặc biệt)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let p = phone.trim().replace(/[^\d+]/g, "");
  if (p.startsWith("+84")) {
    p = "0" + p.slice(3);
  }
  return p;
}

/**
 * Service xử lý Lead & Inquiry tập trung cho toàn bộ Form Public (Listing, Project, Footer, Contact, KyGui)
 */
export async function processPublicLead(input: ProcessLeadInput) {
  const cleanName = input.fullName?.trim();
  const cleanPhone = normalizePhone(input.phone);

  if (!cleanName || !cleanPhone) {
    throw new Error("Họ tên và số điện thoại là bắt buộc");
  }

  // 1. Kiểm tra referral token của CTV (nếu có)
  let collaboratorId: string | null = null;
  let recruiterId: string | null = null;

  if (input.refToken?.trim()) {
    const col = await prisma.collaborator.findUnique({
      where: { publicReferralToken: input.refToken.trim() },
      select: { id: true, referredByUserId: true, status: true },
    });

    if (col && col.status === "ACTIVE") {
      collaboratorId = col.id;
      recruiterId = col.referredByUserId;
    }
  }

  // Chuẩn hóa Enum
  const demand: DemandType = (input.demandType as DemandType) || "TU_VAN";
  const src: LeadSource = (input.source as LeadSource) || "WEBSITE";

  // 2. Tìm Customer hiện có dựa trên số điện thoại chuẩn hóa
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone: cleanPhone },
  });

  let customerId: string;
  let finalAssignedToId: string | null = null;

  if (existingCustomer) {
    // ---- TRƯỜNG HỢP: CUSTOMER ĐÃ TỒN TẠI ----
    customerId = existingCustomer.id;

    if (existingCustomer.assignedToId) {
      // Giữ nguyên người phụ trách cũ, tuyệt đối không cướp lead
      finalAssignedToId = existingCustomer.assignedToId;
    } else if (recruiterId) {
      // Nếu chưa có người phụ trách và lead đến từ CTV -> Gán cho nhân viên tuyển CTV đó
      finalAssignedToId = recruiterId;
      await prisma.customer.update({
        where: { id: customerId },
        data: { assignedToId: finalAssignedToId },
      });
    }

    // Cập nhật email hoặc tên nếu thông tin mới đầy đủ hơn
    if ((!existingCustomer.email && input.email) || existingCustomer.fullName !== cleanName) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          fullName: cleanName,
          email: input.email?.trim() || existingCustomer.email,
        },
      });
    }
  } else {
    // ---- TRƯỜNG HỢP: CUSTOMER MỚI HOÀN TOÀN ----
    if (recruiterId) {
      finalAssignedToId = recruiterId; // Gán cho nhân viên tuyển CTV
    } else {
      finalAssignedToId = null; // Unassigned (Chưa phân công) -> Admin/Manager sẽ chia sau
    }

    const newCustomer = await prisma.customer.create({
      data: {
        fullName: cleanName,
        phone: cleanPhone,
        email: input.email?.trim() || null,
        source: src,
        demandType: demand,
        projectId: input.projectId || null,
        interestedListingId: input.listingId || null,
        assignedToId: finalAssignedToId,
        status: "MOI",
        note: input.note?.trim() || null,
      },
    });

    customerId = newCustomer.id;
  }

  // 3. Luôn luôn tạo mới 1 CustomerInquiry đại diện cho lượt yêu cầu tư vấn này
  const inquiry = await prisma.customerInquiry.create({
    data: {
      customerId,
      source: src,
      demandType: demand,
      note: input.note?.trim() || null,
      projectId: input.projectId || null,
      listingId: input.listingId || null,
      collaboratorId,
      pageUrl: input.pageUrl || null,
      referrerUrl: input.referrerUrl || null,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
    },
    include: {
      collaborator: { select: { fullName: true, publicReferralToken: true } },
    },
  });

  // Ghi log hoạt động chăm sóc khách hàng
  await prisma.customerActivity.create({
    data: {
      customerId,
      authorId: finalAssignedToId || (await getSystemAdminId()),
      type: "NOTE",
      content: `Yêu cầu tư vấn mới (${src}): ${input.note || "Đăng ký từ website"}${
        collaboratorId ? " [Nguồn CTV]" : ""
      }`,
    },
  });

  return {
    customerId,
    inquiryId: inquiry.id,
    assignedToId: finalAssignedToId,
    collaboratorId,
  };
}

/**
 * Lấy Admin ID làm mặc định ghi log nếu chưa phân công
 */
async function getSystemAdminId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  return admin?.id || "system";
}
