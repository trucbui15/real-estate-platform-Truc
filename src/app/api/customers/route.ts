export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCustomers, canManageAllListings } from "@/lib/permissions";
import { pushLeadToGoogleSheet } from "@/lib/googleSheetsService";
import { normalizePhone, validatePhone } from "@/lib/utils";

// GET /api/customers?status=..&keyword=..&assignee=..
// STAFF: thấy khách được giao cho mình + khách giao cho CTV do mình giới thiệu
// MANAGER/ADMIN: thấy toàn bộ khách hàng
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const assignee = searchParams.get("assignee") || undefined;

  let assigneeCondition: any = {};
  if (assignee === "UNASSIGNED") {
    assigneeCondition = { assignedToId: null, assignedCollaboratorId: null };
  } else if (assignee === "USER") {
    assigneeCondition = { NOT: { assignedToId: null } };
  } else if (assignee === "COLLABORATOR") {
    assigneeCondition = { NOT: { assignedCollaboratorId: null } };
  } else if (assignee?.startsWith("user:")) {
    assigneeCondition = { assignedToId: assignee.replace("user:", "") };
  } else if (assignee?.startsWith("collaborator:")) {
    assigneeCondition = { assignedCollaboratorId: assignee.replace("collaborator:", "") };
  }

  const isManagerUp = canManageAllListings(session.user.role);
  const permissionCondition = isManagerUp
    ? {}
    : {
        OR: [
          { assignedToId: session.user.id },
          { assignedCollaborator: { referredByUserId: session.user.id } },
        ],
      };

  const where: any = {
    ...(status ? { status } : {}),
    ...(keyword
      ? { OR: [{ fullName: { contains: keyword, mode: "insensitive" } }, { phone: { contains: keyword } }] }
      : {}),
    ...assigneeCondition,
    ...permissionCondition,
  };

  const customers = await prisma.customer.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
      assignedCollaborator: { select: { id: true, fullName: true, publicReferralToken: true } },
      interestedListing: { select: { title: true, unitCode: true } },
      project: { select: { id: true, name: true, slug: true } },
      inquiries: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          collaborator: { select: { id: true, fullName: true, publicReferralToken: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(customers);
}

// POST /api/customers — Nhân viên/Quản lý/Admin nhập tay 1 khách hàng mới
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.fullName || !body.fullName.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập họ và tên." }, { status: 400 });
  }
  const phoneError = validatePhone(body.phone);
  if (phoneError) {
    return NextResponse.json({ error: phoneError }, { status: 400 });
  }
  if (!body.demandType) {
    return NextResponse.json({ error: "Vui lòng chọn nhu cầu của khách hàng." }, { status: 400 });
  }

  const cleanPhone = normalizePhone(body.phone);

  let assignedToId: string | null = session.user.id;
  let assignedCollaboratorId: string | null = null;
  let assignedAt: Date | null = new Date();

  if (body.assigneeType === "COLLABORATOR" && body.assigneeId) {
    assignedToId = null;
    assignedCollaboratorId = body.assigneeId;
  } else if (body.assigneeType === "USER" && body.assigneeId) {
    assignedToId = body.assigneeId;
    assignedCollaboratorId = null;
  } else if (body.assigneeType === "UNASSIGNED") {
    assignedToId = null;
    assignedCollaboratorId = null;
    assignedAt = null;
  } else if (body.assignedCollaboratorId) {
    assignedToId = null;
    assignedCollaboratorId = body.assignedCollaboratorId;
  } else if (body.assignedToId) {
    assignedToId = body.assignedToId;
    assignedCollaboratorId = null;
  }

  const customer = await prisma.customer.create({
    data: {
      fullName: body.fullName.trim(),
      phone: cleanPhone,
      email: body.email || null,
      source: body.source || "WEBSITE",
      demandType: body.demandType,
      propertyTypeInterest: body.propertyTypeInterest || null,
      areaInterest: body.areaInterest || null,
      budgetFrom: body.budgetFrom ? Number(body.budgetFrom) : null,
      budgetTo: body.budgetTo ? Number(body.budgetTo) : null,
      projectId: body.projectId || null,
      interestedListingId: body.interestedListingId || null,
      status: body.status || "MOI",
      assignedToId,
      assignedCollaboratorId,
      assignedAt,
      nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : null,
      note: body.note || null,
    },
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
      assignedCollaborator: { select: { id: true, fullName: true, publicReferralToken: true } },
    },
  });

  // Tự động đẩy dữ liệu khách mới tạo thủ công sang Google Trang Tính
  pushLeadToGoogleSheet({
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email,
    demandType: customer.demandType,
    source: customer.source + " (CRM)",
    note: customer.note || "Tạo từ Bảng điều khiển CRM",
  });

  return NextResponse.json(customer, { status: 201 });
}
