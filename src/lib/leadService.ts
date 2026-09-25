import { prisma } from "@/lib/prisma";
import { DemandType, LeadSource } from "@prisma/client";
import { pushLeadToGoogleSheet } from "@/lib/googleSheetsService";
import { normalizePhone, validatePhone, isValidPhone } from "@/lib/utils";

export { normalizePhone, validatePhone, isValidPhone };

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
 * Service xử lý Lead & Inquiry tập trung cho toàn bộ Form Public (Listing, Project, Footer, Contact, KyGui)
 */
export async function processPublicLead(input: ProcessLeadInput) {
  const cleanName = input.fullName?.trim();
  if (!cleanName) {
    throw new Error("Vui lòng nhập họ và tên.");
  }

  const phoneError = validatePhone(input.phone);
  if (phoneError) {
    throw new Error(phoneError);
  }

  const cleanPhone = normalizePhone(input.phone);

  // 1. Kiểm tra referral token của CTV (nếu có)
  let collaboratorId: string | null = null;
  let collaboratorInfo: { id: string; fullName: string; publicReferralToken: string } | null = null;

  if (input.refToken?.trim()) {
    const col = await prisma.collaborator.findUnique({
      where: { publicReferralToken: input.refToken.trim() },
      select: { id: true, fullName: true, publicReferralToken: true, status: true },
    });

    if (col && col.status === "ACTIVE") {
      collaboratorId = col.id;
      collaboratorInfo = { id: col.id, fullName: col.fullName, publicReferralToken: col.publicReferralToken };
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
  let finalAssignedCollaboratorId: string | null = null;
  let finalAssignedAt: Date | null = null;

  if (existingCustomer) {
    // ---- TRƯỜNG HỢP: CUSTOMER ĐÃ TỒN TẠI ----
    customerId = existingCustomer.id;
    const hasAssignee = !!(existingCustomer.assignedToId || existingCustomer.assignedCollaboratorId);

    if (!hasAssignee && collaboratorId) {
      // Lead từ CTV A và Customer chưa có người phụ trách -> CTV A mặc định chăm sóc
      finalAssignedCollaboratorId = collaboratorId;
      finalAssignedToId = null;
      finalAssignedAt = new Date();

      await prisma.customer.update({
        where: { id: customerId },
        data: {
          assignedCollaboratorId: finalAssignedCollaboratorId,
          assignedToId: null,
          assignedAt: finalAssignedAt,
        },
      });
    } else {
      // Giữ nguyên người phụ trách cũ, tuyệt đối không cướp lead
      finalAssignedToId = existingCustomer.assignedToId;
      finalAssignedCollaboratorId = existingCustomer.assignedCollaboratorId;
      finalAssignedAt = existingCustomer.assignedAt;
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
    if (collaboratorId) {
      // CTV A mang khách về -> CTV A mặc định chăm sóc
      finalAssignedCollaboratorId = collaboratorId;
      finalAssignedToId = null;
      finalAssignedAt = new Date();
    } else {
      finalAssignedCollaboratorId = null;
      finalAssignedToId = null; // Unassigned (Chưa phân công)
      finalAssignedAt = null;
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
        assignedCollaboratorId: finalAssignedCollaboratorId,
        assignedAt: finalAssignedAt,
        status: "MOI",
        note: input.note?.trim() || null,
      },
    });

    customerId = newCustomer.id;
  }

  // 3. Luôn luôn tạo mới 1 CustomerInquiry đại diện cho lượt yêu cầu tư vấn này (Inquiry.collaboratorId = nguồn CTV)
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

  // Tự động đẩy dữ liệu sang Google Trang Tính (Google Sheets)
  try {
    await pushLeadToGoogleSheet({
      fullName: cleanName,
      phone: cleanPhone,
      email: input.email,
      demandType: String(demand),
      source: String(src),
      note: input.note,
      pageUrl: input.pageUrl,
      collaboratorName: collaboratorInfo?.fullName,
      collaboratorToken: collaboratorInfo?.publicReferralToken,
    });
  } catch (sheetErr) {
    console.error("[LeadService] Lỗi đồng bộ Google Sheets:", sheetErr);
  }

  return {
    customerId,
    inquiryId: inquiry.id,
    assignedToId: finalAssignedToId,
    assignedCollaboratorId: finalAssignedCollaboratorId,
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
