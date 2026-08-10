import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCustomers, canManageAllListings } from "@/lib/permissions";

// GET /api/customers?status=..&keyword=..
// STAFF: chỉ thấy khách được giao cho mình (assignedToId = mình)
// MANAGER/ADMIN: thấy toàn bộ khách hàng
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const keyword = searchParams.get("keyword") || undefined;

  const where: any = {
    ...(status ? { status } : {}),
    ...(keyword
      ? { OR: [{ fullName: { contains: keyword, mode: "insensitive" } }, { phone: { contains: keyword } }] }
      : {}),
    ...(canManageAllListings(session.user.role) ? {} : { assignedToId: session.user.id }),
  };

  const customers = await prisma.customer.findMany({
    where,
    include: {
      assignedTo: { select: { name: true } },
      interestedListing: { select: { title: true, unitCode: true } },
      project: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(customers);
}

// POST /api/customers — Nhân viên/Quản lý/Admin nhập tay 1 khách hàng mới (vd. khách gọi hotline)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageCustomers(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.fullName || !body.phone || !body.demandType) {
    return NextResponse.json({ error: "Thiếu trường bắt buộc (họ tên, sđt, nhu cầu)" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      source: body.source || "WEBSITE",
      demandType: body.demandType,
      propertyTypeInterest: body.propertyTypeInterest || null,
      areaInterest: body.areaInterest || null,
      budgetFrom: body.budgetFrom ? Number(body.budgetFrom) : null,
      budgetTo: body.budgetTo ? Number(body.budgetTo) : null,
      interestedListingId: body.interestedListingId || null,
      status: body.status || "MOI",
      assignedToId: body.assignedToId || session.user.id,
      nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : null,
      note: body.note || null,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
