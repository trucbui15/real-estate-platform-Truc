import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCustomers, canManageAllListings } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      activities: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      assignedTo: { select: { id: true, name: true, role: true, email: true, phone: true } },
      assignedCollaborator: { select: { id: true, fullName: true, publicReferralToken: true, status: true } },
      project: true,
      province: true,
      district: true,
      inquiries: {
        orderBy: { createdAt: "desc" },
        include: {
          collaborator: {
            include: {
              referredByUser: { select: { id: true, name: true, role: true } },
            },
          },
          listing: { select: { id: true, title: true, unitCode: true, slug: true } },
          project: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });

  if (!canManageAllListings(session.user.role) && customer.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Không có quyền xem khách hàng này" }, { status: 403 });
  }
  return NextResponse.json(customer);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const existing = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      assignedCollaborator: { select: { id: true, fullName: true } },
    },
  });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });

  const isManagerUp = canManageAllListings(session.user.role);

  // STAFF chỉ được sửa thông tin khách mà mình được phân công, không được sửa của người khác
  if (!isManagerUp && existing.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Không có quyền sửa khách hàng này" }, { status: 403 });
  }

  const body = await req.json();

  // Kiểm tra xem có yêu cầu thay đổi phân công hay không
  const isAssignmentAttempt =
    body.assigneeType !== undefined ||
    body.assignedToId !== undefined ||
    body.assignedCollaboratorId !== undefined;

  if (isAssignmentAttempt && !isManagerUp) {
    return NextResponse.json({ error: "Chỉ Admin và Quản lý mới có quyền phân công khách hàng" }, { status: 403 });
  }

  let newAssignedToId = existing.assignedToId;
  let newAssignedCollaboratorId = existing.assignedCollaboratorId;
  let newAssignedAt = existing.assignedAt;
  let assignmentChanged = false;
  let newDisplayName = "";

  if (isAssignmentAttempt) {
    let type = body.assigneeType;
    let id = body.assigneeId;

    // Fallback nếu frontend truyền legacy assignedToId
    if (!type && body.assignedToId !== undefined) {
      const val = String(body.assignedToId || "");
      if (!val || val === "UNASSIGNED" || val === "null") {
        type = "UNASSIGNED";
        id = null;
      } else if (val.startsWith("collaborator:")) {
        type = "COLLABORATOR";
        id = val.replace("collaborator:", "");
      } else if (val.startsWith("user:")) {
        type = "USER";
        id = val.replace("user:", "");
      } else {
        type = "USER";
        id = val;
      }
    }

    if (type === "USER") {
      if (!id) return NextResponse.json({ error: "Thiếu ID nhân sự" }, { status: 400 });
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser || !targetUser.active || !["ADMIN", "MANAGER", "STAFF"].includes(targetUser.role)) {
        return NextResponse.json({ error: "Nhân sự không hợp lệ hoặc không còn hoạt động" }, { status: 400 });
      }
      newAssignedToId = targetUser.id;
      newAssignedCollaboratorId = null;
      newAssignedAt = new Date();
      newDisplayName = targetUser.name;
    } else if (type === "COLLABORATOR") {
      if (!id) return NextResponse.json({ error: "Thiếu ID cộng tác viên" }, { status: 400 });
      const targetCol = await prisma.collaborator.findUnique({ where: { id } });
      if (!targetCol || targetCol.status !== "ACTIVE") {
        return NextResponse.json({ error: "Cộng tác viên không tồn tại hoặc chưa kích hoạt" }, { status: 400 });
      }
      newAssignedToId = null;
      newAssignedCollaboratorId = targetCol.id;
      newAssignedAt = new Date();
      newDisplayName = `CTV ${targetCol.fullName}`;
    } else if (type === "UNASSIGNED") {
      newAssignedToId = null;
      newAssignedCollaboratorId = null;
      newAssignedAt = null;
      newDisplayName = "Chưa phân công";
    } else {
      return NextResponse.json({ error: "Loại phân công (assigneeType) không hợp lệ" }, { status: 400 });
    }

    if (
      newAssignedToId !== existing.assignedToId ||
      newAssignedCollaboratorId !== existing.assignedCollaboratorId
    ) {
      assignmentChanged = true;
    }
  }

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: {
      fullName: body.fullName ?? existing.fullName,
      phone: body.phone ?? existing.phone,
      email: body.email ?? existing.email,
      source: body.source ?? existing.source,
      demandType: body.demandType ?? existing.demandType,
      propertyTypeInterest: body.propertyTypeInterest ?? existing.propertyTypeInterest,
      areaInterest: body.areaInterest ?? existing.areaInterest,
      budgetFrom: body.budgetFrom !== undefined ? Number(body.budgetFrom) || null : existing.budgetFrom,
      budgetTo: body.budgetTo !== undefined ? Number(body.budgetTo) || null : existing.budgetTo,
      status: body.status ?? existing.status,
      assignedToId: newAssignedToId,
      assignedCollaboratorId: newAssignedCollaboratorId,
      assignedAt: newAssignedAt,
      nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : existing.nextFollowUpAt,
      note: body.note ?? existing.note,
    },
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
      assignedCollaborator: { select: { id: true, fullName: true, publicReferralToken: true } },
    },
  });

  // Ghi log lịch sử nếu đổi người phụ trách (Requirement 9)
  if (assignmentChanged) {
    const oldDisplayName = existing.assignedTo?.name
      ? existing.assignedTo.name
      : existing.assignedCollaborator?.fullName
      ? `CTV ${existing.assignedCollaborator.fullName}`
      : "Chưa phân công";

    await prisma.customerActivity.create({
      data: {
        customerId: existing.id,
        authorId: session.user.id,
        type: "NOTE",
        content: `${oldDisplayName} → ${newDisplayName}`,
      },
    });
  }

  // Ghi log lịch sử nếu trạng thái chăm sóc thay đổi
  if (body.status && body.status !== existing.status) {
    await prisma.customerActivity.create({
      data: {
        customerId: existing.id,
        authorId: session.user.id,
        type: "STATUS_CHANGE",
        content: `Đổi trạng thái: ${existing.status} → ${body.status}`,
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageAllListings(session.user.role)) {
    return NextResponse.json({ error: "Chỉ Quản lý/Admin được xoá khách hàng" }, { status: 403 });
  }

  const existing = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Khách hàng không tồn tại" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.customerActivity.deleteMany({ where: { customerId: params.id } }),
    prisma.customerInquiry.deleteMany({ where: { customerId: params.id } }),
    prisma.customer.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
