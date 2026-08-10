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
  const existing = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { assignedTo: { select: { name: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });

  if (
    !session ||
    !canManageCustomers(session.user.role) ||
    (!canManageAllListings(session.user.role) && existing.assignedToId !== session.user.id)
  ) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const isManagerUp = canManageAllListings(session.user.role);

  let newAssignedToId = existing.assignedToId;
  if (isManagerUp && body.assignedToId !== undefined) {
    newAssignedToId =
      body.assignedToId === "" || body.assignedToId === "UNASSIGNED" || body.assignedToId === null
        ? null
        : body.assignedToId;
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
      nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : existing.nextFollowUpAt,
      note: body.note ?? existing.note,
    },
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
    },
  });

  // Ghi log lịch sử nếu đổi người phụ trách
  if (body.assignedToId !== undefined && newAssignedToId !== existing.assignedToId) {
    const oldName = existing.assignedTo?.name || "Chưa phân công";
    const newName = updated.assignedTo?.name || "Chưa phân công";
    await prisma.customerActivity.create({
      data: {
        customerId: existing.id,
        authorId: session.user.id,
        type: "NOTE",
        content: `Phân công phụ trách: ${oldName} ➔ ${newName}`,
      },
    });
  }

  // Ghi log lịch sử nếu trạng thái đổi
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
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
